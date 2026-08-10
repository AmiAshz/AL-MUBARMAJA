const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../../src/utils/jwt');

const prisma = new PrismaClient();

describe('Notification Service & Workshop Endpoints', () => {
  let adminToken;
  let adminUser;
  let testVehicle;

  beforeAll(async () => {
    // 1. Create admin user
    adminUser = await prisma.user.create({
      data: {
        name: 'Notification Admin',
        email: `notif.admin.${Date.now()}@test.com`,
        passwordHash: 'hashedpassword',
        role: 'ADMIN'
      }
    });

    adminToken = generateToken(adminUser.id, adminUser.role);
  });

  afterAll(async () => {
    // Cleanup
    if (testVehicle) {
      await prisma.notification.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.complaint.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.progressLog.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.vehicle.delete({ where: { id: testVehicle.id } });
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Should create a vehicle and automatically dispatch/save a registration notification', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Hyundai',
        model: 'i20',
        year: '2020',
        plateNumber: `NOTIF-${Date.now().toString().slice(-4)}`,
        ownerName: 'Notif Test User',
        ownerPhone: '+919876543211',
        dateBroughtIn: new Date().toISOString().split('T')[0],
        status: 'AWAITING_DIAGNOSIS',
        complaints: ['Brake sound']
      });

    expect(res.statusCode).toBe(201);
    testVehicle = res.body.data;
    expect(testVehicle.trackingCode).toMatch(/^VT-[2-9A-Z]{4}-[2-9A-Z]{4}$/);

    // Verify notification was created in database
    const notifs = await prisma.notification.findMany({
      where: { vehicleId: testVehicle.id }
    });
    
    expect(notifs.length).toBe(1);
    expect(notifs[0].messageType).toBe('VEHICLE_REGISTERED');
    expect(notifs[0].phoneNumber).toBe('+919876543211');
    expect(notifs[0].status).toBe('SENT'); // defaulted Mock provider succeeds
  });

  it('2. Should manually resend tracking details and log a new notification dispatch', async () => {
    const res = await request(app)
      .post(`/api/workshop/vehicles/${testVehicle.id}/send-tracking-message`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const notifs = await prisma.notification.findMany({
      where: { vehicleId: testVehicle.id },
      orderBy: { createdAt: 'desc' }
    });

    expect(notifs.length).toBe(2);
    expect(notifs[0].messageType).toBe('VEHICLE_REGISTERED');
    expect(notifs[0].status).toBe('SENT');
  });

  it('3. Should record audit log in progress timeline upon code regeneration', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${testVehicle.id}/tracking/regenerate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.trackingCode).not.toBe(testVehicle.trackingCode);

    // Verify progressLogs contains regenerate log
    const logs = await prisma.progressLog.findMany({
      where: { vehicleId: testVehicle.id }
    });

    const regenLog = logs.find(l => l.message === 'Tracking code regenerated.');
    expect(regenLog).toBeDefined();

    // Verify third notification was sent out
    const notifs = await prisma.notification.findMany({
      where: { vehicleId: testVehicle.id }
    });
    expect(notifs.length).toBe(3);
  });

  it('4. Should automatically trigger VEHICLE_COMPLETED notification upon status transition to COMPLETED', async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${testVehicle.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.statusCode).toBe(200);

    // Verify completion notification in database
    const notifs = await prisma.notification.findMany({
      where: { vehicleId: testVehicle.id, messageType: 'VEHICLE_COMPLETED' }
    });

    expect(notifs.length).toBe(1);
    expect(notifs[0].status).toBe('SENT');
  });

  it('5. Should deduplicate automatic completion messages when shifting back and forth from COMPLETED status', async () => {
    // 1. Shift to IN_PROGRESS
    await request(app)
      .patch(`/api/vehicles/${testVehicle.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'IN_PROGRESS' });

    // 2. Shift back to COMPLETED
    const res = await request(app)
      .patch(`/api/vehicles/${testVehicle.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.statusCode).toBe(200);

    // Verify no new VEHICLE_COMPLETED notifications were created automatically
    const notifs = await prisma.notification.findMany({
      where: { vehicleId: testVehicle.id, messageType: 'VEHICLE_COMPLETED' }
    });

    expect(notifs.length).toBe(1); // Still exactly one from test case 4!
  });

  it('6. Should support manual resending of VEHICLE_COMPLETED notification', async () => {
    const res = await request(app)
      .post(`/api/workshop/vehicles/${testVehicle.id}/send-completion-message`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify a second VEHICLE_COMPLETED notification has been registered manually
    const notifs = await prisma.notification.findMany({
      where: { vehicleId: testVehicle.id, messageType: 'VEHICLE_COMPLETED' }
    });

    expect(notifs.length).toBe(2);
  });
});

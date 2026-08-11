// Mock socket.io globally for E2E tests since we don't start the HTTP server
jest.mock('../../src/utils/socket', () => ({
  getIO: () => ({ emit: jest.fn() }),
  init: jest.fn()
}));

const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../../src/utils/jwt');

const prisma = new PrismaClient();

describe('Manual WhatsApp Notification Flow & Endpoints', () => {
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
        role: 'ADMIN',
        emailVerified: true,
        isActive: true
      }
    });

    adminToken = generateToken(adminUser.id, adminUser.role);
  });

  afterAll(async () => {
    // Cleanup
    if (testVehicle) {
      await prisma.whatsappNotification.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.complaint.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.progressLog.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.vehicle.delete({ where: { id: testVehicle.id } });
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Should create a vehicle and NOT automatically dispatch any registration notification', async () => {
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
    expect(testVehicle.trackingCode).toMatch(/^VNT-[2-9A-Z]{6}$/);

    // Verify NO WhatsApp notifications were automatically created in database
    const notifs = await prisma.whatsappNotification.findMany({
      where: { vehicleId: testVehicle.id }
    });
    
    expect(notifs.length).toBe(0);
  });

  it('2. Should allow manually marking tracking details as sent', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${testVehicle.id}/whatsapp-notifications`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'TRACKING_DETAILS' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const notifs = await prisma.whatsappNotification.findMany({
      where: { vehicleId: testVehicle.id },
      orderBy: { createdAt: 'desc' }
    });

    expect(notifs.length).toBe(1);
    expect(notifs[0].notificationType).toBe('TRACKING_DETAILS');
    expect(notifs[0].status).toBe('SENT');
    expect(notifs[0].recipientPhone).toBe('+919876543211');

    // Verify progress log was logged
    const logs = await prisma.progressLog.findMany({
      where: { vehicleId: testVehicle.id }
    });
    const trackingLog = logs.find(l => l.message === 'Tracking details sent to customer via WhatsApp.');
    expect(trackingLog).toBeDefined();
  });

  it('3. Should record audit log in progress timeline upon code regeneration without automatic dispatch', async () => {
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

    // Verify no new WhatsApp notifications were sent automatically
    const notifs = await prisma.whatsappNotification.findMany({
      where: { vehicleId: testVehicle.id }
    });
    expect(notifs.length).toBe(1); // remains 1 from step 2
  });

  it('4. Should NOT automatically trigger completion notification upon status transition to COMPLETED', async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${testVehicle.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.statusCode).toBe(200);

    // Verify no completion notifications exist in database yet
    const notifs = await prisma.whatsappNotification.findMany({
      where: { vehicleId: testVehicle.id, notificationType: 'REPAIR_COMPLETED' }
    });

    expect(notifs.length).toBe(0);
  });

  it('5. Should support manual marking of completion notification as sent', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${testVehicle.id}/whatsapp-notifications`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'REPAIR_COMPLETED' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify a completion notification has been registered
    const notifs = await prisma.whatsappNotification.findMany({
      where: { vehicleId: testVehicle.id, notificationType: 'REPAIR_COMPLETED' }
    });

    expect(notifs.length).toBe(1);
    expect(notifs[0].status).toBe('SENT');

    // Verify completion progress log was registered
    const logs = await prisma.progressLog.findMany({
      where: { vehicleId: testVehicle.id }
    });
    const completionLog = logs.find(l => l.message === 'Repair completion notification sent to customer via WhatsApp.');
    expect(completionLog).toBeDefined();
  });
});

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

describe('Public Customer Vehicle Tracking API', () => {
  let adminToken;
  let adminUser;
  let testVehicle;
  let trackingCode;

  beforeAll(async () => {
    // 1. Create admin user
    adminUser = await prisma.user.create({
      data: {
        name: 'Tracking Admin',
        email: `tracking.admin.${Date.now()}@test.com`,
        passwordHash: 'hashedpassword',
        role: 'ADMIN',
        emailVerified: true,
        isActive: true
      }
    });

    adminToken = generateToken(adminUser.id, adminUser.role);

    // 2. Create vehicle using protected endpoint
    const vehicleRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Honda',
        model: 'City',
        year: '2021',
        plateNumber: `TEST-${Date.now().toString().slice(-4)}`,
        ownerName: 'Track Test User',
        ownerPhone: '+919999999999',
        dateBroughtIn: new Date().toISOString().split('T')[0],
        status: 'AWAITING_DIAGNOSIS',
        complaints: ['Engine noise']
      });

    testVehicle = vehicleRes.body.data;
    
    // We need to fetch the tracking code from the DB directly since it's not exposed in create response
    const dbVehicle = await prisma.vehicle.findUnique({ where: { id: testVehicle.id } });
    trackingCode = dbVehicle.trackingCode;
  });

  afterAll(async () => {
    // Cleanup
    if (testVehicle) {
      await prisma.complaint.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.progressLog.deleteMany({ where: { vehicleId: testVehicle.id } });
      await prisma.vehicle.delete({ where: { id: testVehicle.id } });
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } });
    }
    await prisma.$disconnect();
  });

  it('1. Should return 404 for tracking request with missing tracking code', async () => {
    const res = await request(app)
      .post('/api/public/vehicle-tracking')
      .send({});
      
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("We couldn't find a vehicle");
  });

  it('2. Should return 404 for tracking request with invalid tracking code', async () => {
    const res = await request(app)
      .post('/api/public/vehicle-tracking')
      .send({
        trackingCode: 'VT-INVALID-CODE'
      });
      
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("We couldn't find a vehicle");
  });

  it('3. Should successfully return sanitized tracking data with correct tracking code', async () => {
    const res = await request(app)
      .post('/api/public/vehicle-tracking')
      .send({
        trackingCode
      });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    const data = res.body.data;
    
    // Assert DTO does NOT contain internal IDs (except safe log IDs), internal notes, etc.
    expect(data.vehicle).toBeDefined();
    expect(data.vehicle.make).toBe('Honda');
    expect(data.vehicle.plateNumber).toBeDefined();
    expect(data.vehicle.id).toBeUndefined(); // ID should not be exposed here
    
    expect(data.status).toBe('AWAITING_DIAGNOSIS');
    expect(data.customerUpdates).toBeInstanceOf(Array);
    
    // By default, no estimates/costs are visible
    expect(data.estimate).toBeUndefined();
    expect(data.finalCost).toBeUndefined();
  });

  it('4. Should invalidate old tracking code after regeneration', async () => {
    // Regenerate code
    const regenRes = await request(app)
      .post(`/api/vehicles/${testVehicle.id}/tracking/regenerate`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(regenRes.statusCode).toBe(200);
    const newTrackingCode = regenRes.body.data.trackingCode;
    expect(newTrackingCode).not.toBe(trackingCode);
    
    // Try old code
    const oldCodeRes = await request(app)
      .post('/api/public/vehicle-tracking')
      .send({ trackingCode });
    expect(oldCodeRes.statusCode).toBe(404);
  });

  it('5. Should trigger rate limit after 5 failed attempts (6th fails with 429)', async () => {
    // 5 failures
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/public/vehicle-tracking').send({ trackingCode: 'FAIL' });
    }
    
    // 6th attempt should be rate limited
    const res = await request(app).post('/api/public/vehicle-tracking').send({ trackingCode: 'FAIL' });
    
    expect(res.statusCode).toBe(429);
    expect(res.body.message).toContain("Too many attempts");
  });
});

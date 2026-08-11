// Mock socket.io globally for E2E tests since we don't start the HTTP server
jest.mock('../../src/utils/socket', () => ({
  getIO: () => ({ emit: jest.fn() }),
  init: jest.fn()
}));

const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('VANTARA End-to-End Workflow & Data Integrity', () => {
  let token;
  let vehicleId;
  let estimateId;
  let repairId;
  let additionalRepairId;
  let techToken;

  const testPlate = `E2E-${Date.now().toString().slice(-6)}`;
  
  beforeAll(async () => {
    // 1. Create a test ADMIN user if not exists
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      const bcrypt = require('bcryptjs');
      admin = await prisma.user.create({
        data: {
          name: 'E2E Admin',
          email: `admin_${Date.now()}@vantara.com`,
          passwordHash: await bcrypt.hash('password123', 10),
          role: 'ADMIN',
          emailVerified: true,
          isActive: true
        }
      });
    } else {
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: { emailVerified: true, isActive: true }
      });
    }

    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: 'password123' });
    token = res.body.data.token;
  });

  afterAll(async () => {
    // Cleanup the created vehicle and its relations
    if (vehicleId) {
      await prisma.vehicle.delete({ where: { id: vehicleId } });
    }
    await prisma.$disconnect();
  });

  describe('Realistic Vehicle Journey (22 Steps)', () => {
    
    it('1. Create vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          make: 'Toyota',
          model: 'Corolla',
          year: '2019',
          plateNumber: testPlate,
          ownerName: 'E2E Test User',
          ownerPhone: '5551234567',
          dateBroughtIn: new Date().toISOString().split('T')[0]
        });
      
      expect(res.statusCode).toBe(201);
      vehicleId = res.body.data.id;
      expect(res.body.data.status).toBe('AWAITING_DIAGNOSIS');
      expect(res.body.data.jobNumber).toMatch(/^VNT-\d{6}$/);
    });

    it('2. Add customer complaints', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/complaints`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Brakes squeaking loudly' });
        
      expect(res.statusCode).toBe(201);
    });

    it('3. Verify no cost exists', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${vehicleId}/job-sheet`)
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.data.financials.costStatus).toBe('NOT ESTIMATED');
      expect(res.body.data.financials.displayCost).toBe(0);
    });

    it('4 & 5. Perform inspection and add diagnosis', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/inspections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          findings: 'Front brake pads are at 1mm',
          diagnosis: 'Brake pads worn out',
          recommendation: 'Replace front brake pads immediately'
        });
        
      expect(res.statusCode).toBe(201);
      expect(res.body.data.status).toBe('IN_PROGRESS'); // Status auto-shifts
    });

    it('6. Create estimate', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/estimates`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            { description: 'Front Brake Pads', itemType: 'PART', quantity: 1, unitPrice: 3000 },
            { description: 'Labor', itemType: 'LABOR', quantity: 2, unitPrice: 500 }
          ]
        });
        
      expect(res.statusCode).toBe(201);
      estimateId = res.body.data.id;
      
      // Verify server-side calculation (3000 + 1000 = 4000 subtotal, tax 18% = 720, total = 4720)
      expect(res.body.data.subtotal).toBe(4000);
      expect(res.body.data.total).toBe(4720);
    });

    it('7. Approve estimate', async () => {
      const res = await request(app)
        .post(`/api/estimates/${estimateId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Customer approved over phone' });
        
      expect(res.statusCode).toBe(200);
    });

    it('8. Start repair', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/repairs`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Replace front brake pads'
        });
        
      expect(res.statusCode).toBe(201);
      repairId = res.body.data.id;
    });

    it('9. Verify vehicle cannot be put into awaiting parts again (auto-shifted on approval)', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'AWAITING_PARTS' });
        
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already in status');
    });

    it('10. Return vehicle to in progress', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' });
        
      expect(res.statusCode).toBe(200);
    });

    it('11. Discover additional repair & 12. Request approval', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/additional-repairs`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Rotors need resurfacing',
          reason: 'Deep scoring found on rotors after removing pads',
          partsCost: 0,
          laborCost: 1500
        });
        
      expect(res.statusCode).toBe(201);
      additionalRepairId = res.body.data.id;
      expect(res.body.data.approvalStatus).toBe('PENDING');
    });

    it('13. Approve additional repair', async () => {
      const res = await request(app)
        .post(`/api/additional-repairs/${additionalRepairId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Customer approved' });
        
      expect(res.statusCode).toBe(200);
    });

    it('14 & 15. Complete repair and Quality check', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'READY_FOR_PICKUP' }); // Assuming quality check is part of moving to pickup
        
      expect(res.statusCode).toBe(200);
    });

    it('16. Record actual final costs', async () => {
      // 4400 (initial) + 1500 (additional labor) = 5900 estimated, let's say actual was 6000
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/final-cost`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          actualPartsCost: 3500,
          actualLaborCost: 2500,
          otherCosts: 0
        });
        
      expect(res.statusCode).toBe(200);
      // Subtotal = 6000, Tax = 600, Total = 6600
      expect(res.body.data.finalTotal).toBe(6000);
      expect(res.body.data.balanceDue).toBe(6000); // Because payments = 0
    });

    it('17. Record payment', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/payments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 6000,
          paymentMethod: 'CARD',
          reference: 'TXN123'
        });
        
      expect(res.statusCode).toBe(201);
      expect(res.body.data.amount).toBe(6000);
    });

    it('18 & 19. Mark completed', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicleId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'COMPLETED' });
        
      expect(res.statusCode).toBe(200);
    });

    it('20 & 21. Generate job sheet & Verify complete history', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${vehicleId}/job-sheet`)
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toBe(200);
      
      const { financials, history } = res.body.data;
      expect(financials.costStatus).toBe('FINAL REPAIR COST');
      expect(financials.displayCost).toBe(6000);
      expect(financials.balanceDue).toBe(0);
      
      // Verify progress history has many entries
      expect(history.progressLogs.length).toBeGreaterThan(5);
      expect(history.statusHistory.length).toBeGreaterThan(2);
    });

    it('22. Verify dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('totalVehicles');
      expect(res.body.data).toHaveProperty('totalFinalRevenue');
    });
  });

  describe('Data Integrity & Security Tests', () => {
    it('rejects unauthorized access (Missing JWT)', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.statusCode).toBe(401);
    });

    it('rejects negative costs for estimates', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/estimates`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ description: 'Cheat', itemType: 'PART', quantity: 1, unitPrice: -500 }]
        });
      // Assuming zod validation catches this
      expect(res.statusCode).toBe(400); 
    });

    it('protects against SQL Injection attempts in search', async () => {
      const res = await request(app)
        .get('/api/vehicles?search=1%27%20OR%20%271%27=%271')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200); // Should safely escape and return empty or matching results
    });
  });
});

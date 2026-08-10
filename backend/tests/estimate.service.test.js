const estimateService = require('../src/services/estimate.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Estimate Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEstimate & server-side totals', () => {
    it('calculates totals server-side and creates estimate', async () => {
      // Mock job number generation
      prisma.estimate.count.mockResolvedValueOnce(0);
      prisma.estimate.create.mockResolvedValueOnce({ id: 'e1' });

      await estimateService.createEstimate('v1', {
        items: [
          { itemType: 'PART', description: 'Brake Pads', quantity: 2, unitPrice: 1000 },
          { itemType: 'LABOR', description: 'Labor', quantity: 1, unitPrice: 500 }
        ]
      }, 'u1');

      // 2 * 1000 = 2000 (PARTS)
      // 1 * 500 = 500 (LABOR)
      // Subtotal = 2500
      // Tax = 18% of 2500 = 450
      // Total = 2950
      
      expect(prisma.estimate.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          partsTotal: 2000,
          laborTotal: 500,
          subtotal: 2500,
          tax: 450,
          total: 2950
        })
      }));
    });
  });

  describe('Approval & History', () => {
    it('approves an estimate, supersedes others, and updates status', async () => {
      prisma.estimate.findUnique.mockResolvedValueOnce({
        id: 'e1',
        status: 'SENT',
        vehicleId: 'v1',
        vehicle: { status: 'AWAITING_DIAGNOSIS' }
      });

      prisma.estimate.update.mockResolvedValueOnce({ id: 'e1', status: 'APPROVED' });
      prisma.vehicle.update.mockResolvedValueOnce({ id: 'v1', status: 'AWAITING_PARTS' });

      await estimateService.approveEstimate('e1', 'u1', 'Approved by owner');

      // Superseding other estimates
      expect(prisma.estimate.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          vehicleId: 'v1',
          id: { not: 'e1' }
        }),
        data: { status: 'SUPERSEDED' }
      }));

      // Marking this estimate APPROVED
      expect(prisma.estimate.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'e1' },
        data: { status: 'APPROVED' }
      }));

      // Vehicle automatically moved to AWAITING_PARTS
      expect(prisma.vehicle.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'v1' },
        data: { status: 'AWAITING_PARTS' }
      }));
    });

    it('rejects an estimate and records rejection reason', async () => {
      prisma.estimate.findUnique.mockResolvedValueOnce({
        id: 'e1',
        status: 'SENT',
        vehicleId: 'v1'
      });

      await estimateService.rejectEstimate('e1', 'u1', 'Too expensive');

      expect(prisma.estimate.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'e1' },
        data: { status: 'REJECTED' }
      }));

      // History / Log created
      expect(prisma.approval.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'REJECTED',
          notes: 'Too expensive'
        })
      }));
    });
  });
});

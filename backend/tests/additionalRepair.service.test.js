const additionalRepairService = require('../src/services/additionalRepair.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Additional Repair Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback(prisma);
    });
  });

  describe('Approval logic & Estimate update', () => {
    it('approves an additional repair and accurately reflects cost on active estimate', async () => {
      const mockRepair = {
        id: 'r1',
        vehicleId: 'v1',
        description: 'New Battery',
        partsCost: 3000,
        laborCost: 500,
        totalCost: 3500, // Calculates properly backend-side (3000+500)
        approvalStatus: 'PENDING'
      };

      prisma.additionalRepair.findUnique.mockResolvedValueOnce(mockRepair);
      
      const mockActiveEstimate = {
        id: 'e1',
        subtotal: 10000,
        tax: 1800,
        total: 11800
      };

      prisma.estimate.findFirst.mockResolvedValueOnce(mockActiveEstimate);
      prisma.additionalRepair.update.mockResolvedValueOnce({ ...mockRepair, approvalStatus: 'APPROVED' });
      
      await additionalRepairService.approveAdditionalRepair('r1', 'u1');

      // Check that estimate was updated
      // Tax on 3500 is 630. Total addition: 4130
      expect(prisma.estimate.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'e1' },
        data: {
          subtotal: 10000 + 3500, // 13500
          tax: 1800 + 630,        // 2430
          total: 11800 + 4130     // 15930
        }
      }));
    });
  });

  describe('Rejection logic', () => {
    it('rejects an additional repair without increasing payable amount on estimate', async () => {
      const mockRepair = {
        id: 'r1',
        approvalStatus: 'PENDING'
      };

      prisma.additionalRepair.findUnique.mockResolvedValueOnce(mockRepair);

      await additionalRepairService.rejectAdditionalRepair('r1', 'u1');

      expect(prisma.additionalRepair.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'r1' },
        data: { approvalStatus: 'REJECTED' }
      }));

      // Ensure estimate.update was NEVER called (thus payable amount remains identical)
      expect(prisma.estimate.update).not.toHaveBeenCalled();
    });
  });
});

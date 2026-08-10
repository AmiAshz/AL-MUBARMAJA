const billingService = require('../src/services/billing.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Billing Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setFinalCost', () => {
    it('sets actual final costs, total, and balance, overriding any estimates', async () => {
      const mockVehicle = {
        id: 'v1',
        status: 'COMPLETED',
        payments: []
      };

      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);

      await billingService.setFinalCost('v1', {
        actualPartsCost: 5000,
        actualLaborCost: 2000,
        otherCosts: 500,
        applyTax: true
      }, 'u1');

      // 5000 + 2000 + 500 = 7500. Tax = 1350. Total = 8850.
      expect(prisma.vehicle.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          finalPartsCost: 5000,
          finalLaborCost: 2000,
          finalOtherCost: 500,
          finalTotalCost: 8850
        })
      }));
    });

    it('rejects billing if status is not COMPLETED or READY_FOR_PICKUP', async () => {
      const mockVehicle = {
        id: 'v1',
        status: 'IN_PROGRESS',
        payments: []
      };

      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);

      await expect(
        billingService.setFinalCost('v1', { actualPartsCost: 100 }, 'u1')
      ).rejects.toThrow('Cannot generate final billing while vehicle is still IN_PROGRESS. Repair must be complete.');
    });
  });
});

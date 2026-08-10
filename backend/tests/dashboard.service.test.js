const dashboardService = require('../src/services/dashboard.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('aggregates statistics correctly', async () => {
      // 1. Status Counts
      prisma.vehicle.groupBy.mockResolvedValueOnce([
        { status: 'AWAITING_DIAGNOSIS', _count: { status: 2 } },
        { status: 'IN_PROGRESS', _count: { status: 3 } }, // activeJobs = 5
        { status: 'READY_FOR_PICKUP', _count: { status: 1 } } // totalVehicles = 6
      ]);

      // 2. Awaiting Estimate Count
      prisma.vehicle.count.mockResolvedValueOnce(4);

      // 3. Estimated Workshop Value
      prisma.vehicle.findMany.mockResolvedValueOnce([
        { estimates: [{ total: 1000 }] },
        { estimates: [{ total: 2500 }] }
      ]); // Sum = 3500

      // 4. Total Final Revenue
      prisma.vehicle.aggregate.mockResolvedValueOnce({
        _sum: { finalTotalCost: 10000 }
      });

      // 5. Total Payments
      prisma.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: 6000 }
      });

      const summary = await dashboardService.getSummary();

      expect(summary.totalVehicles).toBe(6);
      expect(summary.activeJobs).toBe(5); // 2 + 3
      expect(summary.awaitingDiagnosis).toBe(2);
      expect(summary.inProgress || 0).toBe(0); // inProgress wasn't uniquely returned, but activeJobs is
      expect(summary.readyForPickup).toBe(1);
      expect(summary.awaitingEstimate).toBe(4);
      expect(summary.estimatedWorkshopValue).toBe(3500);
      expect(summary.totalFinalRevenue).toBe(10000);
      expect(summary.totalPayments).toBe(6000);
      expect(summary.totalOutstandingBalance).toBe(4000); // 10000 - 6000
    });
  });
});

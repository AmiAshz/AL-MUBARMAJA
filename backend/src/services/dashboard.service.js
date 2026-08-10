const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

const getSummary = async () => {
  // 1. Get raw vehicle status counts
  const statusCounts = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  });

  const countMap = {
    AWAITING_DIAGNOSIS: 0,
    IN_PROGRESS: 0,
    AWAITING_PARTS: 0,
    READY_FOR_PICKUP: 0,
    COMPLETED: 0
  };

  let totalVehicles = 0;
  statusCounts.forEach(c => {
    countMap[c.status] = c._count.status;
    totalVehicles += c._count.status;
  });

  const activeJobs = countMap.AWAITING_DIAGNOSIS + countMap.IN_PROGRESS;

  // 2. Awaiting Estimate (vehicles without an APPROVED estimate)
  // We find how many vehicles DO NOT have any Estimate with status = 'APPROVED'
  const awaitingEstimateCount = await prisma.vehicle.count({
    where: {
      estimates: {
        none: { status: 'APPROVED' }
      }
    }
  });

  // 3. Estimated Workshop Value (sum of APPROVED estimates for unfinished vehicles)
  // Unfinished = not COMPLETED
  const unfinishedVehiclesWithEstimates = await prisma.vehicle.findMany({
    where: {
      status: { not: 'COMPLETED' },
      estimates: { some: { status: 'APPROVED' } }
    },
    select: {
      estimates: {
        where: { status: 'APPROVED' },
        select: { total: true }
      }
    }
  });

  let estimatedWorkshopValue = 0;
  unfinishedVehiclesWithEstimates.forEach(v => {
    v.estimates.forEach(est => {
      estimatedWorkshopValue += est.total;
    });
  });

  // 4. Financials: Total Final Revenue and Outstanding Balance
  // Summing finalTotalCost of vehicles that have it
  const finalRevenueAggr = await prisma.vehicle.aggregate({
    _sum: {
      finalTotalCost: true
    },
    where: {
      finalTotalCost: { not: null }
    }
  });
  
  const totalFinalRevenue = finalRevenueAggr._sum.finalTotalCost || 0;

  // 5. Total Payments
  const paymentsAggr = await prisma.payment.aggregate({
    _sum: {
      amount: true
    }
  });

  const totalPayments = paymentsAggr._sum.amount || 0;

  // 6. Outstanding Balance
  const totalOutstandingBalance = totalFinalRevenue - totalPayments;

  return {
    totalVehicles,
    activeJobs,
    awaitingDiagnosis: countMap.AWAITING_DIAGNOSIS,
    awaitingParts: countMap.AWAITING_PARTS,
    readyForPickup: countMap.READY_FOR_PICKUP,
    completed: countMap.COMPLETED,
    awaitingEstimate: awaitingEstimateCount,
    estimatedWorkshopValue,
    totalFinalRevenue,
    totalPayments,
    totalOutstandingBalance
  };
};

module.exports = {
  getSummary
};

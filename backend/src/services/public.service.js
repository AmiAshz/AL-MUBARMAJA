const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCustomerTrackingInfo = async (trackingCode, phone) => {
  // 1. Find the vehicle with matching tracking code and phone number
  // Do NOT return generic "invalid phone" vs "invalid code" - keep it ambiguous
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      trackingCode,
      ownerPhone: phone,
      isTrackingEnabled: true
    },
    include: {
      progressLogs: {
        where: { isCustomerVisible: true },
        orderBy: { createdAt: 'desc' }
      },
      estimates: {
        where: { isCustomerVisible: true, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!vehicle) {
    return null; // Return null so controller can handle rate limiting/generic error
  }

  // Sanitize and map the response strictly for customer view
  const dto = {
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plateNumber: vehicle.plateNumber
    },
    status: vehicle.status,
    customerUpdates: vehicle.progressLogs.map(log => ({
      id: log.id,
      type: log.type,
      message: log.message,
      createdAt: log.createdAt
    }))
  };

  // Conditionally attach estimate or final cost
  if (vehicle.status === 'COMPLETED' || vehicle.status === 'READY_FOR_PICKUP') {
    if (vehicle.isFinalCostVisible && vehicle.finalTotalCost !== null) {
      dto.finalCost = {
        parts: vehicle.finalPartsCost,
        labor: vehicle.finalLaborCost,
        tax: vehicle.finalTax,
        total: vehicle.finalTotalCost
      };
    }
  } else if (vehicle.estimates && vehicle.estimates.length > 0) {
    const est = vehicle.estimates[0];
    dto.estimate = {
      total: est.total,
      status: est.status,
      notes: est.notes
    };
  }

  return dto;
};

module.exports = {
  getCustomerTrackingInfo
};

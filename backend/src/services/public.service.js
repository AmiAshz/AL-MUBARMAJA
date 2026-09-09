const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCustomerTrackingInfo = async (trackingCode) => {
  if (!trackingCode || !String(trackingCode).trim()) {
    return null;
  }

  const cleanCode = String(trackingCode).trim();

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      trackingCode: cleanCode,
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
    return null; 
  }

  // Sanitize and map the response strictly for customer view
  const progressLogsDto = vehicle.progressLogs.map(log => ({
    id: log.id,
    type: log.type,
    message: log.message,
    createdAt: log.createdAt
  }));

  const dto = {
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plateNumber: vehicle.plateNumber,
      trackingCode: vehicle.trackingCode,
      progressLogs: progressLogsDto
    },
    status: vehicle.status,
    customerUpdates: progressLogsDto
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

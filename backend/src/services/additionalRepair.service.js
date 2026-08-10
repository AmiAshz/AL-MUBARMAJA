const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

const getAdditionalRepairsByVehicle = async (vehicleId) => {
  return await prisma.additionalRepair.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' },
    include: { creator: { select: { name: true } } }
  });
};

const getAdditionalRepairById = async (id) => {
  const repair = await prisma.additionalRepair.findUnique({
    where: { id },
    include: { vehicle: true }
  });

  if (!repair) {
    throw new ApiError(404, 'Additional repair not found');
  }

  return repair;
};

const createAdditionalRepair = async (vehicleId, data, creatorId) => {
  const { description, reason } = data;
  
  const partsCost = parseFloat(data.partsCost || 0);
  const laborCost = parseFloat(data.laborCost || 0);
  const totalCost = partsCost + laborCost;

  if (totalCost <= 0) {
    throw new ApiError(400, 'Total cost must be greater than zero');
  }

  const repair = await prisma.additionalRepair.create({
    data: {
      vehicleId,
      createdById: creatorId,
      description,
      reason,
      partsCost,
      laborCost,
      totalCost,
      approvalStatus: 'PENDING'
    }
  });

  return repair;
};

const updateAdditionalRepair = async (id, data) => {
  const repair = await getAdditionalRepairById(id);

  if (repair.approvalStatus !== 'PENDING') {
    throw new ApiError(400, `Cannot update an additional repair that is ${repair.approvalStatus}`);
  }

  const partsCost = parseFloat(data.partsCost !== undefined ? data.partsCost : repair.partsCost);
  const laborCost = parseFloat(data.laborCost !== undefined ? data.laborCost : repair.laborCost);
  const totalCost = partsCost + laborCost;

  return await prisma.additionalRepair.update({
    where: { id },
    data: {
      description: data.description || repair.description,
      reason: data.reason || repair.reason,
      partsCost,
      laborCost,
      totalCost
    }
  });
};

const approveAdditionalRepair = async (id, userId) => {
  const repair = await getAdditionalRepairById(id);

  if (repair.approvalStatus !== 'PENDING') {
    throw new ApiError(400, `Repair is already ${repair.approvalStatus}`);
  }

  const updatedRepair = await prisma.$transaction(async (tx) => {
    // 1. Mark as approved
    const approved = await tx.additionalRepair.update({
      where: { id },
      data: { approvalStatus: 'APPROVED' }
    });

    // 2. Find the currently APPROVED active estimate
    const activeEstimate = await tx.estimate.findFirst({
      where: { vehicleId: repair.vehicleId, status: 'APPROVED' }
    });

    // 3. If there is an active estimate, update it with this new cost so customer billing matches exactly
    if (activeEstimate) {
      // Calculate tax for the additional amount
      const additionalTax = approved.totalCost * 0.18;
      
      await tx.estimateItem.create({
        data: {
          estimateId: activeEstimate.id,
          description: `Additional Repair: ${approved.description}`,
          itemType: 'OTHER',
          quantity: 1,
          unitPrice: approved.totalCost,
          total: approved.totalCost
        }
      });

      await tx.estimate.update({
        where: { id: activeEstimate.id },
        data: {
          subtotal: activeEstimate.subtotal + approved.totalCost,
          tax: activeEstimate.tax + additionalTax,
          total: activeEstimate.total + approved.totalCost + additionalTax
        }
      });
    }

    return approved;
  });

  // 4. Create the progress log
  await prisma.progressLog.create({
    data: {
      vehicleId: repair.vehicleId,
      userId,
      type: 'ADDITIONAL_REPAIR',
      message: `Additional repair approved: ${repair.description}. Total increased by ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(repair.totalCost)} (plus tax).`
    }
  });

  return updatedRepair;
};

const rejectAdditionalRepair = async (id, userId) => {
  const repair = await getAdditionalRepairById(id);

  if (repair.approvalStatus !== 'PENDING') {
    throw new ApiError(400, `Repair is already ${repair.approvalStatus}`);
  }

  const rejectedRepair = await prisma.additionalRepair.update({
    where: { id },
    data: { approvalStatus: 'REJECTED' }
  });

  // Create progress log
  await prisma.progressLog.create({
    data: {
      vehicleId: repair.vehicleId,
      userId,
      type: 'NOTE', // Or a specific rejection type if it exists in the enum
      message: `Additional repair REJECTED: ${repair.description}. No cost added.`
    }
  });

  return rejectedRepair;
};

module.exports = {
  getAdditionalRepairsByVehicle,
  createAdditionalRepair,
  updateAdditionalRepair,
  approveAdditionalRepair,
  rejectAdditionalRepair
};

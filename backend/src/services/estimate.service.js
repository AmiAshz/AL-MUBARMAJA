const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const socket = require('../utils/socket');
const NotificationService = require('./notification.service');

const prisma = new PrismaClient();

const getEstimatesByVehicle = async (vehicleId) => {
  return await prisma.estimate.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      approvals: true,
      creator: { select: { name: true } }
    }
  });
};

const getEstimateById = async (id) => {
  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: {
      items: true,
      approvals: true,
      creator: { select: { name: true } },
      vehicle: true
    }
  });

  if (!estimate) {
    throw new ApiError(404, 'Estimate not found');
  }

  return estimate;
};

const createEstimate = async (vehicleId, data, creatorId) => {
  const { items } = data; // Expected: [{ description, itemType, quantity, unitPrice }]

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Estimate must contain at least one item');
  }

  // Force backend calculation of totals
  let partsTotal = 0;
  let laborTotal = 0;
  let otherTotal = 0;

  const calculatedItems = items.map(item => {
    const qty = parseInt(item.quantity || 1, 10);
    const price = parseFloat(item.unitPrice || 0);

    if (qty < 1 || price < 0) {
      throw new ApiError(400, 'Quantity must be at least 1 and price cannot be negative');
    }

    const itemTotal = qty * price;
    
    if (item.itemType === 'PART') partsTotal += itemTotal;
    else if (item.itemType === 'LABOR') laborTotal += itemTotal;
    else otherTotal += itemTotal;

    return {
      description: item.description,
      itemType: item.itemType,
      quantity: qty,
      unitPrice: price,
      total: itemTotal
    };
  });

  const subtotal = partsTotal + laborTotal + otherTotal;
  const tax = subtotal * 0.18; // 18% standard tax
  const total = subtotal + tax;

  const estimateNumber = `EST-${Date.now().toString().slice(-6)}`;

  const estimate = await prisma.estimate.create({
    data: {
      vehicleId,
      createdById: creatorId,
      estimateNumber,
      partsTotal,
      laborTotal,
      subtotal,
      tax,
      total,
      isCustomerVisible: data.isCustomerVisible || false,
      status: 'DRAFT',
      items: {
        create: calculatedItems
      }
    },
    include: { items: true }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId,
      userId: creatorId,
      type: 'ESTIMATE_CREATED',
      message: `Repair estimate ${estimateNumber} created for ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}`
    }
  });
  socket.getIO().emit('estimate:updated', estimate);
  socket.getIO().emit('progress:added', { vehicleId });

  return estimate;
};

const updateEstimate = async (id, data, userId) => {
  const estimate = await getEstimateById(id);

  if (['APPROVED', 'REJECTED', 'SUPERSEDED'].includes(estimate.status)) {
    throw new ApiError(400, `Cannot update an estimate in ${estimate.status} status`);
  }

  // To update items properly, we wipe old items and recreate to maintain total integrity easily
  const { items } = data;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Estimate must contain at least one item');
  }

  let partsTotal = 0;
  let laborTotal = 0;
  let otherTotal = 0;

  const calculatedItems = items.map(item => {
    const qty = parseInt(item.quantity || 1, 10);
    const price = parseFloat(item.unitPrice || 0);
    const itemTotal = qty * price;
    
    if (item.itemType === 'PART') partsTotal += itemTotal;
    else if (item.itemType === 'LABOR') laborTotal += itemTotal;
    else otherTotal += itemTotal;

    return {
      description: item.description,
      itemType: item.itemType,
      quantity: qty,
      unitPrice: price,
      total: itemTotal
    };
  });

  const subtotal = partsTotal + laborTotal + otherTotal;
  const tax = subtotal * 0.18; 
  const total = subtotal + tax;

  const updatedEstimate = await prisma.$transaction(async (tx) => {
    await tx.estimateItem.deleteMany({ where: { estimateId: id } });
    
    return await tx.estimate.update({
      where: { id },
      data: {
        partsTotal,
        laborTotal,
        subtotal,
        tax,
        total,
        isCustomerVisible: data.isCustomerVisible !== undefined ? data.isCustomerVisible : estimate.isCustomerVisible,
        items: {
          create: calculatedItems
        }
      },
      include: { items: true }
    });
  });

  await prisma.progressLog.create({
    data: {
      vehicleId: estimate.vehicleId,
      userId,
      type: 'ESTIMATE_UPDATED',
      message: `Estimate ${estimate.estimateNumber} updated.`
    }
  });
  socket.getIO().emit('estimate:updated', updatedEstimate);
  socket.getIO().emit('progress:added', { vehicleId: estimate.vehicleId });

  return updatedEstimate;
};

const sendEstimate = async (id, userId) => {
  const estimate = await getEstimateById(id);
  
  if (estimate.status !== 'DRAFT') {
    throw new ApiError(400, 'Only DRAFT estimates can be sent');
  }

  const updatedEstimate = await prisma.estimate.update({
    where: { id },
    data: { 
      status: 'SENT',
      isCustomerVisible: true
    }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId: estimate.vehicleId,
      userId,
      type: 'STATUS_CHANGE',
      message: `Estimate ${estimate.estimateNumber} sent to customer.`
    }
  });

  // Send notification to customer
  try {
    if (estimate.vehicle) {
      await NotificationService.sendEstimateMessage(estimate.vehicle, estimate.total);
    }
  } catch (err) {
    console.error('[ESTIMATE NOTIFICATION] Failed to send estimate message:', err);
  }

  socket.getIO().emit('estimate:updated', updatedEstimate);
  socket.getIO().emit('progress:added', { vehicleId: estimate.vehicleId });

  return updatedEstimate;
};

const approveEstimate = async (id, userId, notes) => {
  const estimate = await getEstimateById(id);

  if (!['DRAFT', 'SENT', 'PENDING_APPROVAL'].includes(estimate.status)) {
    throw new ApiError(400, `Cannot approve estimate from status ${estimate.status}`);
  }

  // Mark all other estimates as SUPERSEDED for this vehicle
  await prisma.estimate.updateMany({
    where: { 
      vehicleId: estimate.vehicleId, 
      id: { not: id },
      status: { notIn: ['REJECTED', 'SUPERSEDED'] }
    },
    data: { status: 'SUPERSEDED' }
  });

  // Approve this estimate
  const updatedEstimate = await prisma.estimate.update({
    where: { id },
    data: { status: 'APPROVED' }
  });

  await prisma.approval.create({
    data: {
      vehicleId: estimate.vehicleId,
      estimateId: id,
      approvedById: userId,
      status: 'APPROVED',
      notes,
      approvedAt: new Date()
    }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId: estimate.vehicleId,
      userId,
      type: 'APPROVAL',
      message: `Estimate ${estimate.estimateNumber} APPROVED. ${notes || ''}`
    }
  });

  socket.getIO().emit('estimate:updated', updatedEstimate);
  socket.getIO().emit('progress:added', { vehicleId: estimate.vehicleId });

  // Automatically allow vehicle to proceed
  if (estimate.vehicle.status === 'AWAITING_DIAGNOSIS' || estimate.vehicle.status === 'IN_PROGRESS') {
    await prisma.jobStatusHistory.create({
      data: {
        vehicleId: estimate.vehicleId,
        previousStatus: estimate.vehicle.status,
        newStatus: 'AWAITING_PARTS',
        changedById: userId
      }
    });

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: estimate.vehicleId },
      data: { status: 'AWAITING_PARTS' }
    });
    
    socket.getIO().emit('vehicle:statusChanged', updatedVehicle);
  }

  return updatedEstimate;
};

const rejectEstimate = async (id, userId, notes) => {
  const estimate = await getEstimateById(id);

  if (!notes) {
    throw new ApiError(400, 'Rejection reason (notes) is required');
  }

  const updatedEstimate = await prisma.estimate.update({
    where: { id },
    data: { status: 'REJECTED' }
  });

  await prisma.approval.create({
    data: {
      vehicleId: estimate.vehicleId,
      estimateId: id,
      approvedById: userId,
      status: 'REJECTED',
      notes,
      approvedAt: new Date()
    }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId: estimate.vehicleId,
      userId,
      type: 'APPROVAL',
      message: `Estimate ${estimate.estimateNumber} REJECTED. Reason: ${notes}`
    }
  });
  socket.getIO().emit('estimate:updated', updatedEstimate);
  socket.getIO().emit('progress:added', { vehicleId: estimate.vehicleId });

  return updatedEstimate;
};

module.exports = {
  getEstimatesByVehicle,
  getEstimateById,
  createEstimate,
  updateEstimate,
  sendEstimate,
  approveEstimate,
  rejectEstimate
};

const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const socket = require('../utils/socket');

const prisma = new PrismaClient();

const getFinalCostAndBalance = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { payments: true }
  });

  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  const finalTotal = vehicle.finalTotalCost || 0;
  
  const totalPaid = vehicle.payments.reduce((acc, curr) => acc + curr.amount, 0);
  const balanceDue = finalTotal - totalPaid;

  return {
    finalPartsCost: vehicle.finalPartsCost || 0,
    finalLaborCost: vehicle.finalLaborCost || 0,
    finalOtherCost: vehicle.finalOtherCost || 0,
    finalTax: vehicle.finalTax || 0,
    finalTotal: finalTotal,
    totalPaid,
    balanceDue
  };
};

const setFinalCost = async (vehicleId, data, userId) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const parts = parseFloat(data.actualPartsCost || 0);
  const labor = parseFloat(data.actualLaborCost || 0);
  const other = parseFloat(data.otherCosts || 0);
  
  const subtotal = parts + labor + other;
  
  // Tax if applicable, using 15% standard for Saudi Arabia (instead of 18%) if requested, or passing a manual amount
  const tax = data.applyTax ? (subtotal * 0.15) : parseFloat(data.tax || 0);
  
  const finalTotal = subtotal + tax;

  const updatedVehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      finalPartsCost: parts,
      finalLaborCost: labor,
      finalOtherCost: other,
      finalTax: tax,
      finalTotalCost: finalTotal
    }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId,
      userId,
      type: 'NOTE',
      message: `Final billing calculated. Total cost: ${finalTotal.toFixed(2)} ر.س`
    }
  });

  return await getFinalCostAndBalance(vehicleId);
};

const getPayments = async (vehicleId) => {
  return await prisma.payment.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' },
    include: { creator: { select: { name: true } } }
  });
};

const addPayment = async (vehicleId, data, userId) => {
  const { amount, paymentMethod, reference, notes } = data;

  const paymentAmount = parseFloat(amount || 0);
  if (paymentAmount <= 0) {
    throw new ApiError(400, 'Payment amount must be greater than zero');
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  
  if (!vehicle.finalTotalCost) {
    throw new ApiError(400, 'Cannot process payments before the final cost is calculated.');
  }

  const payment = await prisma.payment.create({
    data: {
      vehicleId,
      amount: paymentAmount,
      paymentMethod,
      reference,
      notes,
      paidAt: new Date(),
      createdById: userId
    }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId,
      userId,
      type: 'PAYMENT',
      message: `Payment received: ${paymentAmount.toFixed(2)} ر.س via ${paymentMethod}`
    }
  });

  // Calculate new balance
  const balanceCheck = await getFinalCostAndBalance(vehicleId);
  if (balanceCheck.balanceDue <= 0 && vehicle.status !== 'COMPLETED') {
    // Optionally move status to COMPLETED if paid in full and picked up
    await prisma.progressLog.create({
      data: {
        vehicleId,
        userId,
        type: 'NOTE',
        message: 'Vehicle is fully paid.'
      }
    });
  }

  socket.getIO().emit('payment:added', payment);
  socket.getIO().emit('progress:added', { vehicleId });

  return payment;
};

module.exports = {
  getFinalCostAndBalance,
  setFinalCost,
  getPayments,
  addPayment
};

const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const socket = require('../utils/socket');
const crypto = require('crypto');
const NotificationService = require('./notification.service');

const prisma = new PrismaClient();

const generateTrackingCode = () => {
  const chars = '0123456789ABCDEF';
  const genBlock = (len) => {
    let block = '';
    for (let i = 0; i < len; i++) {
      block += chars.charAt(crypto.randomInt(0, chars.length));
    }
    return block;
  };
  return `VT-${genBlock(4)}-${genBlock(4)}-${genBlock(4)}`;
};

/**
 * Generate a unique Job Number e.g. VT-000001
 */
const generateJobNumber = async () => {
  const latestVehicle = await prisma.vehicle.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { jobNumber: true }
  });

  if (!latestVehicle) return 'VT-000001';

  // Replace either VNT- or VT- to support backward compatibility
  const lastNumStr = latestVehicle.jobNumber.replace('VNT-', '').replace('VT-', '');
  const lastNum = parseInt(lastNumStr, 10);
  const nextNum = (lastNum + 1).toString().padStart(6, '0');
  return `VT-${nextNum}`;
};

/**
 * Fetch all active vehicles with their relational counts/totals, pagination, and search
 */
const getAllVehicles = async (page = 1, limit = 20, search = '', status = '') => {
  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { plateNumber: { contains: search } },
      { ownerName: { contains: search } },
      { make: { contains: search } },
      { model: { contains: search } },
      { vin: { contains: search } },
      { jobNumber: { contains: search } }
    ];
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        complaints: true,
        progressLogs: { orderBy: { createdAt: 'desc' } },
        estimates: { where: { status: 'APPROVED' } },
        additionalRepairs: { where: { approvalStatus: 'APPROVED' } },
        notifications: { orderBy: { createdAt: 'desc' } },
        whatsappNotifications: {
          orderBy: { createdAt: 'desc' },
          include: { sentBy: { select: { name: true } } }
        }
      }
    }),
    prisma.vehicle.count({ where })
  ]);

  return {
    data: vehicles,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: take,
      totalPages: Math.ceil(total / take)
    }
  };
};

/**
 * Fetch massive relational tree for a specific vehicle
 */
const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      complaints: true,
      inspections: { include: { technician: { select: { name: true } } } },
      repairs: { include: { technician: { select: { name: true } } } },
      estimates: {
        include: {
          items: true,
          approvals: { include: { approvedBy: { select: { name: true } } } },
          creator: { select: { name: true } }
        }
      },
      additionalRepairs: { include: { creator: { select: { name: true } } } },
      progressLogs: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      },
      jobStatusHistory: {
        orderBy: { createdAt: 'desc' },
        include: { changedBy: { select: { name: true } } }
      },
      payments: true,
      notifications: { orderBy: { createdAt: 'desc' } },
      whatsappNotifications: {
        orderBy: { createdAt: 'desc' },
        include: { sentBy: { select: { name: true } } }
      }
    }
  });

  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  return vehicle;
};

/**
 * Intake a new vehicle with initial complaints and audit logs
 */
const createVehicle = async (data, userId) => {
  const { complaints, ...rawVehicleData } = data;

  const make = rawVehicleData.make ? String(rawVehicleData.make).trim() : '';
  const model = rawVehicleData.model ? String(rawVehicleData.model).trim() : '';
  const plateNumber = rawVehicleData.plateNumber ? String(rawVehicleData.plateNumber).trim() : '';
  const ownerName = rawVehicleData.ownerName ? String(rawVehicleData.ownerName).trim() : '';
  const ownerPhone = rawVehicleData.ownerPhone ? String(rawVehicleData.ownerPhone).trim() : '';
  const year = rawVehicleData.year !== undefined && rawVehicleData.year !== null && String(rawVehicleData.year).trim() !== ''
    ? String(rawVehicleData.year).trim()
    : String(new Date().getFullYear());
  const vin = rawVehicleData.vin ? String(rawVehicleData.vin).trim() : null;
  const dateBroughtIn = rawVehicleData.dateBroughtIn ? String(rawVehicleData.dateBroughtIn) : new Date().toISOString().split('T')[0];
  const timeBroughtIn = rawVehicleData.timeBroughtIn ? String(rawVehicleData.timeBroughtIn) : null;
  const initialCondition = rawVehicleData.initialCondition ? String(rawVehicleData.initialCondition) : null;
  const status = rawVehicleData.status || 'AWAITING_DIAGNOSIS';

  if (!make || !model || !plateNumber || !ownerName || !ownerPhone) {
    throw new ApiError(400, 'Missing required vehicle details. Make, Model, Plate Number, Owner Name, and Phone Number are required.');
  }

  const jobNumber = await generateJobNumber();
  const trackingCode = generateTrackingCode();

  const formattedComplaints = Array.isArray(complaints)
    ? complaints
        .map(c => (typeof c === 'string' ? c.trim() : c?.description ? String(c.description).trim() : ''))
        .filter(desc => desc.length > 0)
        .map(description => ({ description }))
    : [];

  const vehicle = await prisma.vehicle.create({
    data: {
      make,
      model,
      year,
      plateNumber,
      vin,
      ownerName,
      ownerPhone,
      dateBroughtIn,
      timeBroughtIn,
      initialCondition,
      status,
      jobNumber,
      trackingCode,
      isTrackingEnabled: true,
      complaints: {
        create: formattedComplaints
      },
      progressLogs: {
        create: [{
          type: 'VEHICLE_RECEIVED',
          message: 'Vehicle received.',
          userId
        }]
      }
    },
    include: { complaints: true, progressLogs: true }
  });

  // No automatic WhatsApp messages sent on registration
  const latestNotification = null;

  const vehicleWithNotification = {
    ...vehicle,
    latestNotification
  };

  socket.getIO().emit('vehicle:created', vehicleWithNotification);
  socket.getIO().emit('progress:added', { vehicleId: vehicle.id });

  return vehicleWithNotification;
};

/**
 * Update Vehicle Details
 */
const updateVehicle = async (id, data) => {
  const updateData = {};
  if (data.make !== undefined) updateData.make = String(data.make).trim();
  if (data.model !== undefined) updateData.model = String(data.model).trim();
  if (data.year !== undefined && data.year !== null) updateData.year = String(data.year).trim();
  if (data.plateNumber !== undefined) updateData.plateNumber = String(data.plateNumber).trim();
  if (data.vin !== undefined) updateData.vin = data.vin ? String(data.vin).trim() : null;
  if (data.ownerName !== undefined) updateData.ownerName = String(data.ownerName).trim();
  if (data.ownerPhone !== undefined) updateData.ownerPhone = String(data.ownerPhone).trim();
  if (data.dateBroughtIn !== undefined) updateData.dateBroughtIn = String(data.dateBroughtIn);
  if (data.timeBroughtIn !== undefined) updateData.timeBroughtIn = data.timeBroughtIn ? String(data.timeBroughtIn) : null;
  if (data.initialCondition !== undefined) updateData.initialCondition = data.initialCondition ? String(data.initialCondition) : null;
  if (data.status !== undefined) updateData.status = data.status;

  const updatedVehicle = await prisma.vehicle.update({
    where: { id },
    data: updateData
  });
  socket.getIO().emit('vehicle:updated', updatedVehicle);
  return updatedVehicle;
};

/**
 * Delete Vehicle
 */
const deleteVehicle = async (id) => {
  await prisma.vehicle.delete({ where: { id } });
  socket.getIO().emit('vehicle:deleted', { id });
  return true;
};

/**
 * Change status safely with audit trails
 */
const updateVehicleStatus = async (id, newStatus, userId, lang = 'ar') => {
  const validStatuses = [
    'AWAITING_DIAGNOSIS',
    'IN_PROGRESS',
    'AWAITING_PARTS',
    'READY_FOR_PICKUP',
    'COMPLETED'
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const vehicle = await getVehicleById(id);

  if (vehicle.status === newStatus) {
    throw new ApiError(400, `Vehicle is already in status ${newStatus}`);
  }

  const STATUS_AR = {
    'AWAITING_DIAGNOSIS': 'بانتظار التشخيص',
    'IN_PROGRESS': 'قيد الإصلاح',
    'AWAITING_PARTS': 'بانتظار قطع الغيار',
    'READY_FOR_PICKUP': 'جاهزة للاستلام',
    'COMPLETED': 'مكتملة'
  };

  const STATUS_EN = {
    'AWAITING_DIAGNOSIS': 'Awaiting Diagnosis',
    'IN_PROGRESS': 'In Progress',
    'AWAITING_PARTS': 'Awaiting Parts',
    'READY_FOR_PICKUP': 'Ready for Pickup',
    'COMPLETED': 'Completed'
  };

  const prevStatusLabel = (lang === 'en' ? STATUS_EN : STATUS_AR)[vehicle.status] || vehicle.status;
  const newStatusLabel = (lang === 'en' ? STATUS_EN : STATUS_AR)[newStatus] || newStatus;

  const logMessage = lang === 'en'
    ? `Repair status changed from "${prevStatusLabel}" to "${newStatusLabel}".`
    : `تم تغيير حالة الإصلاح من "${prevStatusLabel}" إلى "${newStatusLabel}".`;

  const updatedVehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      status: newStatus,
      jobStatusHistory: {
        create: [{
          previousStatus: vehicle.status,
          newStatus: newStatus,
          changedById: userId
        }]
      },
      progressLogs: {
        create: [{
          type: 'STATUS_CHANGE',
          message: logMessage,
          userId
        }]
      }
    }
  });

  const statusMessages = {
    'IN_PROGRESS': 'Repair work on your vehicle has started.',
    'AWAITING_PARTS': 'Your vehicle is currently awaiting required parts.',
    'READY_FOR_PICKUP': 'Your vehicle is ready for pickup.'
  };

  const notifyMsg = statusMessages[newStatus];
  let latestNotification = null;

  if (newStatus === 'COMPLETED') {
    // Deduplicate: check if a VEHICLE_COMPLETED notification was already sent successfully
    const alreadySent = await prisma.notification.findFirst({
      where: {
        vehicleId: id,
        messageType: 'VEHICLE_COMPLETED',
        status: 'SENT'
      }
    });

    if (!alreadySent) {
      try {
        latestNotification = await NotificationService.sendCompletionMessage(updatedVehicle);
      } catch (err) {
        console.error('[STATUS NOTIFICATION] Failed to send completion message:', err);
      }
    }
  } else if (notifyMsg) {
    try {
      latestNotification = await NotificationService.sendMilestoneMessage(updatedVehicle, newStatus, notifyMsg);
    } catch (err) {
      console.error(`[STATUS NOTIFICATION] Failed to send milestone message for ${newStatus}:`, err);
    }
  }

  const updatedVehicleWithNotif = {
    ...updatedVehicle,
    latestNotification
  };

  socket.getIO().emit('vehicle:statusChanged', updatedVehicleWithNotif);
  socket.getIO().emit('progress:added', { vehicleId: id });

  return updatedVehicleWithNotif;
};

/**
 * Log inspection and diagnosis findings
 */
const addInspection = async (id, data, technicianId) => {
  const { findings, diagnosis, recommendation } = data;

  await prisma.inspection.create({
    data: {
      vehicleId: id,
      technicianId,
      findings,
      diagnosis,
      recommendation
    }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId: id,
      userId: technicianId,
      type: 'DIAGNOSIS',
      message: `Diagnosis completed. Findings: ${findings}`
    }
  });

  // Automatically shift status if still awaiting
  const vehicle = await getVehicleById(id);

  try {
    await NotificationService.sendMilestoneMessage(vehicle, 'DIAGNOSIS', 'Your vehicle inspection is complete. A repair estimate is being prepared.');
  } catch (err) {
    console.error('[DIAGNOSIS NOTIFICATION] Failed to send milestone message:', err);
  }

  if (vehicle.status === 'AWAITING_DIAGNOSIS') {
    await updateVehicleStatus(id, 'IN_PROGRESS', technicianId);
  }

  return await getVehicleById(id);
};

/**
 * Generate a comprehensive, printable Job Sheet
 */
const getJobSheet = async (id) => {
  const vehicle = await getVehicleById(id);

  // Format the job sheet explicitly following business rules
  let costStatus = 'NOT ESTIMATED';
  let displayCost = 0;

  const approvedEstimate = vehicle.estimates.find(e => e.status === 'APPROVED');

  if (vehicle.finalTotalCost !== null && vehicle.finalTotalCost !== undefined) {
    costStatus = 'FINAL REPAIR COST';
    displayCost = vehicle.finalTotalCost;
  } else if (approvedEstimate) {
    costStatus = 'ESTIMATED COST';
    displayCost = approvedEstimate.total;
  }

  // Calculate total paid
  const totalPaid = vehicle.payments.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    brand: {
      name: 'AL Mubarmaja / المبرمج',
      slogan: 'Care Behind Every Repair. / عناية تتواجد مع كل عملية إصلاح.'
    },
    jobDetails: {
      jobNumber: vehicle.jobNumber,
      status: vehicle.status,
      dateBroughtIn: vehicle.dateBroughtIn,
      timeBroughtIn: vehicle.timeBroughtIn,
      initialCondition: vehicle.initialCondition
    },
    vehicleDetails: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plateNumber: vehicle.plateNumber,
      vin: vehicle.vin
    },
    ownerDetails: {
      name: vehicle.ownerName,
      phone: vehicle.ownerPhone
    },
    complaints: vehicle.complaints,
    inspections: vehicle.inspections, // Contains diagnosis and recommendations
    financials: {
      costStatus,
      displayCost,
      finalRepairCost: vehicle.finalTotalCost,
      totalPaid,
      balanceDue: vehicle.finalTotalCost !== null ? vehicle.finalTotalCost - totalPaid : null,
      approvedEstimate: approvedEstimate || null,
      estimateHistory: vehicle.estimates,
      additionalRepairs: vehicle.additionalRepairs,
      payments: vehicle.payments
    },
    history: {
      progressLogs: vehicle.progressLogs,
      statusHistory: vehicle.jobStatusHistory
    }
  };
};

const getInspections = async (vehicleId) => {
  return await prisma.inspection.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' },
    include: { technician: { select: { name: true } } }
  });
};

const updateInspection = async (id, data) => {
  return await prisma.inspection.update({
    where: { id },
    data: {
      findings: data.findings,
      diagnosis: data.diagnosis,
      recommendation: data.recommendation,
      technicianId: data.technician_id || data.technicianId
    }
  });
};

/**
 * Record customer approval
 */
const recordApproval = async (id, estimateId, status, notes, approverId) => {
  const approval = await prisma.approval.create({
    data: {
      vehicleId: id,
      estimateId,
      approvedById: approverId,
      status, // 'APPROVED' or 'REJECTED'
      notes,
      approvedAt: new Date()
    }
  });

  await prisma.estimate.update({
    where: { id: estimateId },
    data: { status }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId: id,
      userId: approverId,
      type: 'APPROVAL',
      message: `Estimate ${status}: ${notes || 'No additional notes'}`
    }
  });

  return approval;
};



/**
 * Complaints
 */
const addComplaint = async (vehicleId, description) => {
  return await prisma.complaint.create({
    data: { vehicleId, description }
  });
};

const updateComplaint = async (id, description) => {
  return await prisma.complaint.update({
    where: { id },
    data: { description }
  });
};

const deleteComplaint = async (id) => {
  await prisma.complaint.delete({ where: { id } });
  return true;
};

/**
 * Progress Logs
 */
const addProgressLog = async (vehicleId, type, message, userId, isCustomerVisible = false) => {
  return await prisma.progressLog.create({
    data: {
      vehicleId,
      type,
      message,
      userId,
      isCustomerVisible
    }
  });
};

const getProgressLogs = async (vehicleId) => {
  return await prisma.progressLog.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } }
  });
};

/**
 * Tracking Management
 */
const regenerateTrackingCode = async (id, userId) => {
  const newCode = generateTrackingCode();
  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      trackingCode: newCode,
      progressLogs: {
        create: [{
          type: 'STATUS_CHANGE',
          message: 'Tracking code regenerated.',
          userId
        }]
      }
    },
    include: { progressLogs: true, complaints: true }
  });

  // No automatic WhatsApp messages on regeneration
  const latestNotification = null;

  const updatedVehicle = {
    ...vehicle,
    latestNotification
  };

  socket.getIO().emit('vehicle:updated', updatedVehicle);
  socket.getIO().emit('progress:added', { vehicleId: id });

  return updatedVehicle;
};

const updateTrackingStatus = async (id, isTrackingEnabled) => {
  return await prisma.vehicle.update({
    where: { id },
    data: { isTrackingEnabled }
  });
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  addInspection,
  getInspections,
  updateInspection,
  recordApproval,
  addComplaint,
  updateComplaint,
  deleteComplaint,
  addProgressLog,
  getProgressLogs,
  getJobSheet,
  regenerateTrackingCode,
  updateTrackingStatus
};

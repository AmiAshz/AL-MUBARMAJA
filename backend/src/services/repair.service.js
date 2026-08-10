const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const socket = require('../utils/socket');

const prisma = new PrismaClient();

const getRepairsByVehicle = async (vehicleId) => {
  return await prisma.repair.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'asc' },
    include: { technician: { select: { name: true, role: true } } }
  });
};

const getRepairById = async (id) => {
  const repair = await prisma.repair.findUnique({
    where: { id },
    include: { technician: { select: { name: true, role: true } } }
  });

  if (!repair) {
    throw new ApiError(404, 'Repair task not found');
  }

  return repair;
};

const createRepair = async (vehicleId, data, assignerId) => {
  const { description, technicianId } = data;
  
  if (!description) {
    throw new ApiError(400, 'Repair description is required');
  }

  // Ensure technician exists if assigned
  if (technicianId) {
    const tech = await prisma.user.findUnique({ where: { id: technicianId } });
    if (!tech) throw new ApiError(404, 'Assigned technician not found');
  }

  const status = technicianId ? 'ASSIGNED' : 'PENDING';

  const repair = await prisma.repair.create({
    data: {
      vehicleId,
      description,
      technicianId: technicianId || assignerId, // Fallback to assigner if not specified
      status
    }
  });

  await prisma.progressLog.create({
    data: {
      vehicleId,
      userId: assignerId,
      type: 'REPAIR_STARTED', // Conceptually a repair task logged
      message: `Repair task created: ${description} (Status: ${status})`
    }
  });

  socket.getIO().emit('repair:updated', repair);
  socket.getIO().emit('progress:added', { vehicleId });

  return repair;
};

const updateRepair = async (id, data, user) => {
  const repair = await getRepairById(id);

  // Permission Check: Only the assigned tech, or an ADMIN/MANAGER can update this repair
  if (user && user.role !== 'ADMIN' && user.role !== 'MANAGER' && repair.technicianId !== user.id) {
    throw new ApiError(403, 'You do not have permission to update this repair task. Only the assigned technician or managers can update it.');
  }

  const { status, description, technicianId } = data;
  
  const updateData = {};
  if (description) updateData.description = description;
  if (technicianId) updateData.technicianId = technicianId;
  
  let statusChanged = false;
  let logMessage = `Repair task '${repair.description}' updated.`;

  if (status && status !== repair.status) {
    updateData.status = status;
    statusChanged = true;
    logMessage = `Repair task '${repair.description}' status changed to ${status}.`;

    if (status === 'IN_PROGRESS' && repair.status !== 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    }
    if (status === 'COMPLETED' && repair.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }
  }

  const updatedRepair = await prisma.repair.update({
    where: { id },
    data: updateData
  });

  if (statusChanged || technicianId !== repair.technicianId) {
    if (technicianId && technicianId !== repair.technicianId) {
      logMessage = `Repair task '${repair.description}' reassigned.`;
    }

    await prisma.progressLog.create({
      data: {
        vehicleId: repair.vehicleId,
        userId: user ? user.id : null,
        type: status === 'COMPLETED' ? 'REPAIR_COMPLETED' : 'STATUS_CHANGE',
        message: logMessage
      }
    });
  }

  socket.getIO().emit('repair:updated', updatedRepair);
  socket.getIO().emit('progress:added', { vehicleId: repair.vehicleId });

  return updatedRepair;
};

module.exports = {
  getRepairsByVehicle,
  getRepairById,
  createRepair,
  updateRepair
};

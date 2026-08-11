const vehicleService = require('../services/vehicle.service');
const ApiResponse = require('../utils/apiResponse');

const getVehicles = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await vehicleService.getAllVehicles(page, limit, search, status);
    res.status(200).json(new ApiResponse(200, result, 'Vehicles retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    // Assuming auth middleware sets req.user.id
    const userId = req.user ? req.user.id : null; 
    const vehicle = await vehicleService.createVehicle(req.body, userId);
    res.status(201).json(new ApiResponse(201, vehicle, 'Vehicle created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.user ? req.user.id : null;
    const vehicle = await vehicleService.updateVehicleStatus(req.params.id, status, userId);
    res.status(200).json(new ApiResponse(200, vehicle, 'Status updated successfully'));
  } catch (error) {
    next(error);
  }
};

const addInspection = async (req, res, next) => {
  try {
    const technicianId = req.body.technician_id || req.body.technicianId || (req.user ? req.user.id : null);
    if (!technicianId) {
      throw new ApiError(400, "Technician ID is required");
    }
    const vehicle = await vehicleService.addInspection(req.params.id, req.body, technicianId);
    res.status(201).json(new ApiResponse(201, vehicle, 'Inspection recorded successfully'));
  } catch (error) {
    next(error);
  }
};

const getInspections = async (req, res, next) => {
  try {
    const inspections = await vehicleService.getInspections(req.params.id);
    res.status(200).json(new ApiResponse(200, inspections, 'Inspections retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateInspection = async (req, res, next) => {
  try {
    const inspection = await vehicleService.updateInspection(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, inspection, 'Inspection updated successfully'));
  } catch (error) {
    next(error);
  }
};



const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Vehicle deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const addComplaint = async (req, res, next) => {
  try {
    const complaint = await vehicleService.addComplaint(req.params.id, req.body.description);
    res.status(201).json(new ApiResponse(201, complaint, 'Complaint added successfully'));
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await vehicleService.updateComplaint(req.params.id, req.body.description);
    res.status(200).json(new ApiResponse(200, complaint, 'Complaint updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    await vehicleService.deleteComplaint(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Complaint deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const addProgressLogManual = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { type = 'NOTE', message, isCustomerVisible } = req.body;
    const log = await vehicleService.addProgressLog(req.params.id, type, message, userId, isCustomerVisible);
    res.status(201).json(new ApiResponse(201, log, 'Progress log added successfully'));
  } catch (error) {
    next(error);
  }
};

const getProgressLogs = async (req, res, next) => {
  try {
    const logs = await vehicleService.getProgressLogs(req.params.id);
    res.status(200).json(new ApiResponse(200, logs, 'Progress logs retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getJobSheet = async (req, res, next) => {
  try {
    const jobSheet = await vehicleService.getJobSheet(req.params.id);
    res.status(200).json(new ApiResponse(200, jobSheet, 'Job sheet generated successfully'));
  } catch (error) {
    next(error);
  }
};

const regenerateTrackingCode = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const vehicle = await vehicleService.regenerateTrackingCode(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, { trackingCode: vehicle.trackingCode, latestNotification: vehicle.latestNotification }, 'Tracking code regenerated successfully'));
  } catch (error) {
    next(error);
  }
};

const resendTrackingMessage = async (req, res, next) => {
  try {
    const NotificationService = require('../services/notification.service');
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    const notification = await NotificationService.sendVehicleTrackingMessage(vehicle, vehicle.trackingCode);
    res.status(200).json(new ApiResponse(200, { notification }, 'Tracking message resent successfully'));
  } catch (error) {
    next(error);
  }
};

const updateTrackingStatus = async (req, res, next) => {
  try {
    const { isTrackingEnabled } = req.body;
    const vehicle = await vehicleService.updateTrackingStatus(req.params.id, isTrackingEnabled);
    res.status(200).json(new ApiResponse(200, { isTrackingEnabled: vehicle.isTrackingEnabled }, 'Tracking status updated successfully'));
  } catch (error) {
    next(error);
  }
};

const resendCompletionMessage = async (req, res, next) => {
  try {
    const NotificationService = require('../services/notification.service');
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    const notification = await NotificationService.sendCompletionMessage(vehicle);
    res.status(200).json(new ApiResponse(200, { notification }, 'Completion message resent successfully'));
  } catch (error) {
    next(error);
  }
};

const sendWhatsappNotification = async (req, res, next) => {
  try {
    const { type } = req.body;
    const userId = req.user.id;
    const WhatsappService = require('../services/whatsapp.service');
    
    const result = await WhatsappService.markSent(req.params.id, type, userId);
    res.status(200).json(new ApiResponse(200, result, 'WhatsApp status logged successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  updateStatus,
  addInspection,
  getInspections,
  updateInspection,
  deleteVehicle,
  addComplaint,
  updateComplaint,
  deleteComplaint,
  addProgressLogManual,
  getProgressLogs,
  getJobSheet,
  regenerateTrackingCode,
  updateTrackingStatus,
  resendTrackingMessage,
  resendCompletionMessage,
  sendWhatsappNotification
};

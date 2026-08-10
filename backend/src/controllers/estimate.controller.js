const estimateService = require('../services/estimate.service');
const ApiResponse = require('../utils/apiResponse');

const getEstimatesByVehicle = async (req, res, next) => {
  try {
    const estimates = await estimateService.getEstimatesByVehicle(req.params.id);
    res.status(200).json(new ApiResponse(200, estimates, 'Estimates retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getEstimateById = async (req, res, next) => {
  try {
    const estimate = await estimateService.getEstimateById(req.params.id);
    res.status(200).json(new ApiResponse(200, estimate, 'Estimate retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createEstimate = async (req, res, next) => {
  try {
    const creatorId = req.user ? req.user.id : null;
    if (!creatorId) throw new Error("Authentication required to create estimate");
    
    const estimate = await estimateService.createEstimate(req.params.id, req.body, creatorId);
    res.status(201).json(new ApiResponse(201, estimate, 'Estimate created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateEstimate = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const estimate = await estimateService.updateEstimate(req.params.id, req.body, userId);
    res.status(200).json(new ApiResponse(200, estimate, 'Estimate updated successfully'));
  } catch (error) {
    next(error);
  }
};

const sendEstimate = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const estimate = await estimateService.sendEstimate(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, estimate, 'Estimate sent successfully'));
  } catch (error) {
    next(error);
  }
};

const approveEstimate = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { notes } = req.body;
    const estimate = await estimateService.approveEstimate(req.params.id, userId, notes);
    res.status(200).json(new ApiResponse(200, estimate, 'Estimate approved successfully'));
  } catch (error) {
    next(error);
  }
};

const rejectEstimate = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { notes } = req.body;
    const estimate = await estimateService.rejectEstimate(req.params.id, userId, notes);
    res.status(200).json(new ApiResponse(200, estimate, 'Estimate rejected successfully'));
  } catch (error) {
    next(error);
  }
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

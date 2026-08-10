const additionalRepairService = require('../services/additionalRepair.service');
const ApiResponse = require('../utils/apiResponse');

const getAdditionalRepairs = async (req, res, next) => {
  try {
    const repairs = await additionalRepairService.getAdditionalRepairsByVehicle(req.params.id);
    res.status(200).json(new ApiResponse(200, repairs, 'Additional repairs retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createAdditionalRepair = async (req, res, next) => {
  try {
    const creatorId = req.user ? req.user.id : null;
    const repair = await additionalRepairService.createAdditionalRepair(req.params.id, req.body, creatorId);
    res.status(201).json(new ApiResponse(201, repair, 'Additional repair requested successfully'));
  } catch (error) {
    next(error);
  }
};

const updateAdditionalRepair = async (req, res, next) => {
  try {
    const repair = await additionalRepairService.updateAdditionalRepair(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, repair, 'Additional repair updated successfully'));
  } catch (error) {
    next(error);
  }
};

const approveAdditionalRepair = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const repair = await additionalRepairService.approveAdditionalRepair(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, repair, 'Additional repair approved successfully'));
  } catch (error) {
    next(error);
  }
};

const rejectAdditionalRepair = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const repair = await additionalRepairService.rejectAdditionalRepair(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, repair, 'Additional repair rejected successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdditionalRepairs,
  createAdditionalRepair,
  updateAdditionalRepair,
  approveAdditionalRepair,
  rejectAdditionalRepair
};

const repairService = require('../services/repair.service');
const ApiResponse = require('../utils/apiResponse');

const getRepairs = async (req, res, next) => {
  try {
    const repairs = await repairService.getRepairsByVehicle(req.params.id);
    res.status(200).json(new ApiResponse(200, repairs, 'Repairs retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createRepair = async (req, res, next) => {
  try {
    const creatorId = req.user ? req.user.id : null;
    const repair = await repairService.createRepair(req.params.id, req.body, creatorId);
    res.status(201).json(new ApiResponse(201, repair, 'Repair task created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateRepair = async (req, res, next) => {
  try {
    const user = req.user || null;
    const repair = await repairService.updateRepair(req.params.id, req.body, user);
    res.status(200).json(new ApiResponse(200, repair, 'Repair task updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRepairs,
  createRepair,
  updateRepair
};

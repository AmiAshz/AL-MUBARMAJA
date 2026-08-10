const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse');

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    res.status(200).json(new ApiResponse(200, summary, 'Dashboard summary retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary
};

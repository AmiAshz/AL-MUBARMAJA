const billingService = require('../services/billing.service');
const ApiResponse = require('../utils/apiResponse');

const getFinalCost = async (req, res, next) => {
  try {
    const cost = await billingService.getFinalCostAndBalance(req.params.id);
    res.status(200).json(new ApiResponse(200, cost, 'Final cost and balance retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const setFinalCost = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const cost = await billingService.setFinalCost(req.params.id, req.body, userId);
    res.status(200).json(new ApiResponse(200, cost, 'Final cost recorded successfully'));
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await billingService.getPayments(req.params.id);
    res.status(200).json(new ApiResponse(200, payments, 'Payments retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const addPayment = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const payment = await billingService.addPayment(req.params.id, req.body, userId);
    res.status(201).json(new ApiResponse(201, payment, 'Payment recorded successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinalCost,
  setFinalCost,
  getPayments,
  addPayment
};

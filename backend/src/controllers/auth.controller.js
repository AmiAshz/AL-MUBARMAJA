const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, { user, token }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.status(200).json(new ApiResponse(200, { user, token }, 'User logged in successfully'));
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, req.user, 'Current user retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};

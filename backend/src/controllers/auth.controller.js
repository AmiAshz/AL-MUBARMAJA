const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { user } = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, { user }, 'User registered successfully. Please verify your email.'));
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

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.status(200).json(new ApiResponse(200, result, 'Email verified successfully'));
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const message = await authService.resendVerificationEmail(email);
    res.status(200).json(new ApiResponse(200, { message }, message));
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const message = await authService.forgotPassword(email);
    res.status(200).json(new ApiResponse(200, { message }, message));
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json(new ApiResponse(200, result, 'Password reset successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};

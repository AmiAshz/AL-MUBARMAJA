const AdminService = require('../services/admin.service');
const ApiResponse = require('../utils/apiResponse');

const getEmployees = async (req, res, next) => {
  try {
    const employees = await AdminService.getAllEmployees(req.query);
    res.status(200).json(new ApiResponse(200, employees, 'Employees retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getEmployee = async (req, res, next) => {
  try {
    const employee = await AdminService.getEmployeeById(req.params.id);
    res.status(200).json(new ApiResponse(200, employee, 'Employee retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await AdminService.createEmployee(req.body, req.user.id);
    res.status(201).json(new ApiResponse(201, employee, 'Employee created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await AdminService.updateEmployee(req.params.id, req.body, req.user.id);
    res.status(200).json(new ApiResponse(200, employee, 'Employee updated successfully'));
  } catch (error) {
    next(error);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const employee = await AdminService.toggleEmployeeStatus(req.params.id, isActive, req.user.id);
    res.status(200).json(new ApiResponse(200, employee, 'Employee status updated successfully'));
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await AdminService.resetEmployeePassword(req.params.id, password, req.user.id);
    res.status(200).json(new ApiResponse(200, result, 'Employee password reset successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const result = await AdminService.deleteEmployee(req.params.id, req.user.id);
    res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  toggleStatus,
  resetPassword,
  deleteEmployee
};

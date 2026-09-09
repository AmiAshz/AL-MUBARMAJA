const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  toggleStatus,
  resetPassword,
  deleteEmployee
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Guard all admin routes with JWT authentication + ADMIN role check
router.use(protect);
router.use(authorize('ADMIN'));

router.route('/employees')
  .get(getEmployees)
  .post(createEmployee);

router.route('/employees/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

router.patch('/employees/:id/status', toggleStatus);
router.post('/employees/:id/reset-password', resetPassword);

module.exports = router;

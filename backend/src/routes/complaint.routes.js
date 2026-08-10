const express = require('express');
const { 
  updateComplaint, 
  deleteComplaint 
} = require('../controllers/vehicle.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/:id')
  .put(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), updateComplaint)
  .delete(authorize('ADMIN', 'MANAGER'), deleteComplaint);

module.exports = router;

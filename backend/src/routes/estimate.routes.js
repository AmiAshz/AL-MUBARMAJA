const express = require('express');
const { 
  getEstimateById,
  updateEstimate,
  sendEstimate,
  approveEstimate,
  rejectEstimate
} = require('../controllers/estimate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/:id')
  .get(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), getEstimateById)
  .put(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), updateEstimate);

router.post('/:id/send', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), sendEstimate);
router.post('/:id/approve', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), approveEstimate);
router.post('/:id/reject', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), rejectEstimate);

module.exports = router;

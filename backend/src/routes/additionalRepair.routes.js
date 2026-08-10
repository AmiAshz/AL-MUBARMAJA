const express = require('express');
const { 
  updateAdditionalRepair,
  approveAdditionalRepair,
  rejectAdditionalRepair
} = require('../controllers/additionalRepair.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/:id')
  .put(authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN'), updateAdditionalRepair);

router.post('/:id/approve', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), approveAdditionalRepair);
router.post('/:id/reject', authorize('ADMIN', 'MANAGER', 'SERVICE_ADVISOR'), rejectAdditionalRepair);

module.exports = router;

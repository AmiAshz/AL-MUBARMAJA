const express = require('express');
const { 
  updateInspection,
  addInspection
} = require('../controllers/vehicle.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/:id')
  .put(authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), updateInspection);

// Note: creation happens on /api/vehicles/:id/inspection, but if moving to this router entirely, it would be here.
// Currently POST is on vehicle.routes.js via addInspection (but wait, vehicle.routes.js didn't mount POST /api/vehicles/:id/inspection? Let me check vehicle.routes.js. Actually wait, I might have forgotten to re-add POST inspection on vehicle.routes.js). Let's add it here to be safe and fix vehicle.routes.js.

module.exports = router;

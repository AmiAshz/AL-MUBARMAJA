const express = require('express');
const { 
  updateRepair
} = require('../controllers/repair.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/:id')
  .put(authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), updateRepair);

module.exports = router;

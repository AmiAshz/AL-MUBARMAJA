const express = require('express');
const { getPublicServices, getServices, createService, updateService, deleteService } = require('../controllers/service.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/public', getPublicServices);

// Protected routes (admin/manager)
router.get('/', protect, getServices);
router.post('/', protect, authorize('ADMIN', 'MANAGER'), createService);
router.put('/:id', protect, authorize('ADMIN', 'MANAGER'), updateService);
router.delete('/:id', protect, authorize('ADMIN', 'MANAGER'), deleteService);

module.exports = router;

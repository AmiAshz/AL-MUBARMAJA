const express = require('express');
const { getPublicSettings, updateSettings, getEmailStatus, sendTestEmail } = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);

// Protected routes (admin only)
router.put('/', protect, authorize('ADMIN'), updateSettings);
router.get('/email-status', protect, authorize('ADMIN'), getEmailStatus);
router.post('/test-email', protect, authorize('ADMIN'), sendTestEmail);

module.exports = router;

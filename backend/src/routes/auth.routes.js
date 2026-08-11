const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  verifyEmail, 
  resendVerification, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { resendVerificationLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

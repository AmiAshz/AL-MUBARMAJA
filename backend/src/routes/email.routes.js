const express = require('express');
const { 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth.controller');

const router = express.Router();

// The user requested endpoints under /api/email/
// Map these to the existing robust auth controllers which handle DB token management and call EmailService
router.post('/verify', verifyEmail);
router.post('/password-reset', forgotPassword);
router.post('/reset-password', resetPassword); // added for the actual reset action

module.exports = router;

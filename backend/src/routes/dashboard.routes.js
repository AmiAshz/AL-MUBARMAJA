const express = require('express');
const { 
  getSummary
} = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/summary')
  .get(authorize('ADMIN', 'MANAGER'), getSummary);

module.exports = router;

const express = require('express');
const { getVehicleTracking } = require('../controllers/public.controller');
const { publicTrackingLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.post('/vehicle-tracking', publicTrackingLimiter, getVehicleTracking);

module.exports = router;

const publicService = require('../services/public.service');
const { recordFailedAttempt } = require('../middleware/rateLimiter.middleware');

const getVehicleTracking = async (req, res, next) => {
  try {
    const { trackingCode, phone } = req.body;

    if (!trackingCode || !phone) {
      // Record failure for rate limiting
      recordFailedAttempt(req.clientIp);
      // Return 400 for bad request format, but don't leak whether the format was the issue vs the credentials
      // Actually, standardizing on a 404 generic message is safest for ALL credential errors.
      return res.status(404).json({
        success: false,
        message: "We couldn't find a vehicle with those details."
      });
    }

    const trackingData = await publicService.getCustomerTrackingInfo(trackingCode, phone);

    if (!trackingData) {
      recordFailedAttempt(req.clientIp);
      return res.status(404).json({
        success: false,
        message: "We couldn't find a vehicle with those details."
      });
    }

    res.status(200).json({
      success: true,
      data: trackingData
    });
  } catch (error) {
    // Internal server errors can fall through to next, but we shouldn't leak them
    next(error);
  }
};

module.exports = {
  getVehicleTracking
};

const publicService = require('../services/public.service');
const { recordFailedAttempt } = require('../middleware/rateLimiter.middleware');

const getVehicleTracking = async (req, res, next) => {
  try {
    const { trackingCode } = req.body;

    if (!trackingCode || !String(trackingCode).trim()) {
      recordFailedAttempt(req.clientIp);
      return res.status(404).json({
        success: false,
        message: "We couldn't find a vehicle with that tracking code."
      });
    }

    const trackingData = await publicService.getCustomerTrackingInfo(trackingCode);

    if (!trackingData) {
      recordFailedAttempt(req.clientIp);
      return res.status(404).json({
        success: false,
        message: "We couldn't find a vehicle with that tracking code."
      });
    }

    res.status(200).json({
      success: true,
      data: trackingData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicleTracking
};

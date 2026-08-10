const trackingAttempts = new Map();

// 20 failed attempts per IP per 2 minutes (relaxed for development)
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 2 * 60 * 1000;

const publicTrackingLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  const now = Date.now();
  const attemptInfo = trackingAttempts.get(ip) || { count: 0, firstAttempt: now };

  // Reset if window has passed
  if (now - attemptInfo.firstAttempt > WINDOW_MS) {
    attemptInfo.count = 0;
    attemptInfo.firstAttempt = now;
  }

  if (attemptInfo.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many attempts from this IP, please try again after 15 minutes.'
    });
  }

  // We only count failures. So we attach a helper to the response.
  // We'll increment it manually in the controller if it fails.
  req.rateLimitInfo = attemptInfo;
  req.clientIp = ip;

  next();
};

const recordFailedAttempt = (ip) => {
  const attemptInfo = trackingAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
  attemptInfo.count += 1;
  trackingAttempts.set(ip, attemptInfo);
};

module.exports = {
  publicTrackingLimiter,
  recordFailedAttempt
};

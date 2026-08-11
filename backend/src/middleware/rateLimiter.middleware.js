const trackingAttempts = new Map();
const verificationAttempts = new Map();

// 5 failed attempts in testing, 20 in development/production
const MAX_ATTEMPTS = process.env.NODE_ENV === 'test' ? 5 : 20;
const WINDOW_MS = 2 * 60 * 1000;

// Max 3 requests per 15 minutes for resending verification emails
const RESEND_MAX_ATTEMPTS = 3;
const RESEND_WINDOW_MS = 15 * 60 * 1000;

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

const resendVerificationLimiter = (req, res, next) => {
  const key = req.body.email || req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  const attemptInfo = verificationAttempts.get(key) || { count: 0, firstAttempt: now };

  // Reset if window has passed
  if (now - attemptInfo.firstAttempt > RESEND_WINDOW_MS) {
    attemptInfo.count = 0;
    attemptInfo.firstAttempt = now;
  }

  if (attemptInfo.count >= RESEND_MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many verification email requests. Please try again after 15 minutes.'
    });
  }

  attemptInfo.count += 1;
  verificationAttempts.set(key, attemptInfo);

  next();
};

module.exports = {
  publicTrackingLimiter,
  recordFailedAttempt,
  resendVerificationLimiter
};

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route. Missing token.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, emailVerified: true, isActive: true }
    });

    if (!req.user) {
      return next(new ApiError(401, 'User belonging to this token no longer exists.'));
    }

    if (!req.user.emailVerified) {
      return next(new ApiError(403, 'Please verify your email before accessing this resource.'));
    }

    if (!req.user.isActive) {
      return next(new ApiError(403, 'Your account is deactivated. Please contact support.'));
    }

    next();
  } catch (err) {
    return next(new ApiError(401, 'Not authorized to access this route. Invalid token.'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role '${req.user.role}' is not authorized to access this route.`));
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};

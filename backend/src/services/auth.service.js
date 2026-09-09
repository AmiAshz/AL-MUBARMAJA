const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const EmailService = require('./email.service');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

/**
 * Helper to hash tokens
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const registerUser = async (data) => {
  const { name, email, password, phone, role } = data;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const userCount = await prisma.user.count();
  const assignedRole = role || (userCount === 0 ? 'ADMIN' : 'SERVICE_ADVISOR');

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      role: assignedRole,
      emailVerified: false,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

  await prisma.verificationToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt
    }
  });

  // Send verification email (non-blocking)
  EmailService.sendVerificationEmail(user, token).catch(err => {
    console.error('Failed to send verification email on registration:', err);
  });

  // Return user without JWT token, as registration does not log the user in immediately
  return { user };
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check email verification status
  if (!user.emailVerified) {
    throw new ApiError(403, 'Please verify your email before signing in.');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new ApiError(403, 'Your account is deactivated. Please contact support.');
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

const verifyEmail = async (token) => {
  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record || record.used) {
    throw new ApiError(400, 'Verification link is invalid or has already been used.');
  }

  if (new Date() > record.expiresAt) {
    throw new ApiError(400, 'Verification link has expired.');
  }

  // Mark user verified and token used
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true }
  });

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { used: true }
  });

  // Send welcome email (non-blocking)
  EmailService.sendWelcomeEmail(record.user).catch(err => {
    console.error('Failed to send welcome email:', err);
  });

  return { success: true, message: 'Email verified successfully.' };
};

const resendVerificationEmail = async (email) => {
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user && !user.emailVerified) {
    // Invalidate previous verification tokens
    await prisma.verificationToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await prisma.verificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    // Send email (non-blocking)
    EmailService.sendVerificationEmail(user, token).catch(err => {
      console.error('Failed to send verification email on resend:', err);
    });
  }

  // Generic response to avoid revealing existence of account
  return 'If an account requires verification, a new verification email has been sent.';
};

const forgotPassword = async (email) => {
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Invalidate previous reset tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    // Send reset email (non-blocking)
    EmailService.sendPasswordResetEmail(user, token).catch(err => {
      console.error('Failed to send password reset email:', err);
    });
  }

  // Generic response to avoid revealing email existence
  return 'If an account exists, a password reset link has been sent.';
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!record || record.used) {
    throw new ApiError(400, 'Password reset link is invalid or has already been used.');
  }

  if (new Date() > record.expiresAt) {
    throw new ApiError(400, 'Password reset link has expired.');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Update user password and invalidate token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true }
    })
  ]);

  return { success: true, message: 'Password has been reset successfully.' };
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
};

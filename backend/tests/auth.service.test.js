jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../src/services/email.service');

const authService = require('../src/services/auth.service');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmailService = require('../src/services/email.service');

const prisma = new PrismaClient();

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('successfully registers a user as unverified and sends verification email', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null); // Email not taken
      bcrypt.genSalt.mockResolvedValueOnce('salt');
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      
      prisma.user.create.mockResolvedValueOnce({
        id: 'u1',
        name: 'Test',
        email: 'test@example.com',
        role: 'TECHNICIAN'
      });

      prisma.verificationToken.create.mockResolvedValueOnce({
        id: 'vt1',
        tokenHash: 'hashed_token',
        userId: 'u1'
      });

      EmailService.sendVerificationEmail.mockResolvedValueOnce({ success: true });

      const result = await authService.registerUser({
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        role: 'TECHNICIAN'
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.verificationToken.create).toHaveBeenCalled();
      expect(EmailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result.user.id).toBe('u1');
      expect(result.token).toBeUndefined(); // Register should not return a token now
    });

    it('throws error if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(
        authService.registerUser({
          name: 'Test',
          email: 'test@example.com',
          password: 'password'
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('throws error if email format is invalid', async () => {
      await expect(
        authService.registerUser({
          name: 'Test',
          email: 'invalid-email',
          password: 'password'
        })
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('loginUser', () => {
    it('successfully logs in with valid, verified, and active credentials', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'ADMIN',
        emailVerified: true,
        isActive: true
      });

      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mock_jwt_token');

      const result = await authService.loginUser('test@example.com', 'password');
      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.role).toBe('ADMIN');
    });

    it('throws error on invalid credentials (wrong password)', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        emailVerified: true,
        isActive: true
      });

      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        authService.loginUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws error if email is not verified', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        emailVerified: false,
        isActive: true
      });

      bcrypt.compare.mockResolvedValueOnce(true);

      await expect(
        authService.loginUser('test@example.com', 'password')
      ).rejects.toThrow('Please verify your email before signing in.');
    });

    it('throws error if account is deactivated', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        emailVerified: true,
        isActive: false
      });

      bcrypt.compare.mockResolvedValueOnce(true);

      await expect(
        authService.loginUser('test@example.com', 'password')
      ).rejects.toThrow('Your account is deactivated. Please contact support.');
    });
  });

  describe('verifyEmail', () => {
    it('successfully verifies email with valid token', async () => {
      prisma.verificationToken.findUnique.mockResolvedValueOnce({
        id: 'vt1',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 10000),
        used: false,
        user: { id: 'u1', name: 'Test', email: 'test@example.com' }
      });

      prisma.user.update.mockResolvedValueOnce({ id: 'u1', emailVerified: true });
      prisma.verificationToken.update.mockResolvedValueOnce({ id: 'vt1', used: true });
      EmailService.sendWelcomeEmail.mockResolvedValueOnce({ success: true });

      const result = await authService.verifyEmail('token123');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { emailVerified: true }
      });
      expect(prisma.verificationToken.update).toHaveBeenCalledWith({
        where: { id: 'vt1' },
        data: { used: true }
      });
      expect(EmailService.sendWelcomeEmail).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('throws error for invalid or already used token', async () => {
      prisma.verificationToken.findUnique.mockResolvedValueOnce(null);

      await expect(
        authService.verifyEmail('invalidtoken')
      ).rejects.toThrow('Verification link is invalid or has already been used.');
    });

    it('throws error for expired token', async () => {
      prisma.verificationToken.findUnique.mockResolvedValueOnce({
        id: 'vt1',
        userId: 'u1',
        expiresAt: new Date(Date.now() - 10000), // Expired 10s ago
        used: false
      });

      await expect(
        authService.verifyEmail('expiredtoken')
      ).rejects.toThrow('Verification link has expired.');
    });
  });

  describe('resendVerificationEmail', () => {
    it('invalidates old tokens and sends a new one if user is unverified', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        name: 'Test',
        email: 'test@example.com',
        emailVerified: false
      });

      prisma.verificationToken.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.verificationToken.create.mockResolvedValueOnce({ id: 'vt2' });
      EmailService.sendVerificationEmail.mockResolvedValueOnce({ success: true });

      const result = await authService.resendVerificationEmail('test@example.com');

      expect(prisma.verificationToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', used: false },
        data: { used: true }
      });
      expect(prisma.verificationToken.create).toHaveBeenCalled();
      expect(EmailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toContain('sent');
    });

    it('returns generic response even if email does not exist for security', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      const result = await authService.resendVerificationEmail('nonexistent@test.com');
      expect(result).toContain('sent');
      expect(prisma.verificationToken.create).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('creates reset token and sends email if user exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        name: 'Test',
        email: 'test@example.com'
      });

      prisma.passwordResetToken.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.passwordResetToken.create.mockResolvedValueOnce({ id: 'prt1' });
      EmailService.sendPasswordResetEmail.mockResolvedValueOnce({ success: true });

      const result = await authService.forgotPassword('test@example.com');

      expect(prisma.passwordResetToken.updateMany).toHaveBeenCalled();
      expect(prisma.passwordResetToken.create).toHaveBeenCalled();
      expect(EmailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result).toContain('sent');
    });
  });

  describe('resetPassword', () => {
    it('successfully resets password and invalidates token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValueOnce({
        id: 'prt1',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 10000),
        used: false
      });

      bcrypt.genSalt.mockResolvedValueOnce('salt');
      bcrypt.hash.mockResolvedValueOnce('newHashedPassword');
      prisma.$transaction.mockResolvedValueOnce([{}, {}]);

      const result = await authService.resetPassword('token123', 'newpassword');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('throws error if password is too short', async () => {
      await expect(
        authService.resetPassword('token123', 'short')
      ).rejects.toThrow('Password must be at least 6 characters long');
    });
  });
});

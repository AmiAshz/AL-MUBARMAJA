jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const authService = require('../src/services/auth.service');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('successfully registers a user and returns token', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null); // Email not taken
      bcrypt.genSalt.mockResolvedValueOnce('salt');
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      
      prisma.user.create.mockResolvedValueOnce({
        id: 'u1',
        name: 'Test',
        email: 'test@example.com',
        role: 'TECHNICIAN'
      });

      jwt.sign.mockReturnValueOnce('mock_jwt_token');

      const result = await authService.registerUser({
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        role: 'TECHNICIAN'
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.id).toBe('u1');
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
  });

  describe('loginUser', () => {
    it('successfully logs in with valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'ADMIN'
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
        passwordHash: 'hashed'
      });

      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        authService.loginUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});

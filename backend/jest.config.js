module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__mocks__/prisma.js'],
  testMatch: ['**/tests/**/*.test.js', '!**/tests/e2e/**/*.test.js'],
  transform: {},
};

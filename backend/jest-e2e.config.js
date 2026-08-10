module.exports = {
  testEnvironment: 'node',
  // Do NOT load the Prisma global mock file for E2E tests!
  // setupFilesAfterEnv: ['<rootDir>/src/__mocks__/prisma.js'],
  testMatch: ['**/tests/e2e/**/*.e2e.test.js'],
  transform: {},
  // Optional: if you have a setup file for e2e (like clearing db)
  // setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
};

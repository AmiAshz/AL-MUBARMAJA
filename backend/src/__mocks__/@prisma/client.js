// We must pass through to the actual client so E2E tests don't get an empty object
const actualPrisma = jest.requireActual('@prisma/client');
module.exports = actualPrisma;

const prismaMock = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(async (cb) => cb(prismaMock)),
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  vehicle: {
    count: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn()
  },
  estimate: {
    count: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  estimateItem: {
    create: jest.fn(),
    deleteMany: jest.fn()
  },
  additionalRepair: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  payment: {
    aggregate: jest.fn()
  },
  inspection: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  repair: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  inspection: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  repair: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  progressLog: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  jobStatusHistory: {
    create: jest.fn()
  },
  approval: {
    create: jest.fn()
  }
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock)
  };
});

// Mock the socket util using the absolute module name if possible, or just require it
jest.mock('../utils/socket', () => {
  return {
    getIO: () => ({
      emit: jest.fn()
    }),
    init: jest.fn()
  };
});

global.prismaMock = prismaMock;

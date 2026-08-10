const vehicleService = require('../src/services/vehicle.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Status & Progress History Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates vehicle status and logs history correctly', async () => {
    const mockVehicle = { id: 'v1', status: 'AWAITING_DIAGNOSIS' };
    
    // Initial fetch to check current status
    prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
    
    prisma.vehicle.update.mockResolvedValue({ ...mockVehicle, status: 'IN_PROGRESS' });

    await vehicleService.updateVehicleStatus('v1', 'IN_PROGRESS', 'user1');

    expect(prisma.vehicle.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'v1' },
      data: expect.objectContaining({
        status: 'IN_PROGRESS',
        jobStatusHistory: {
          create: [{
            previousStatus: 'AWAITING_DIAGNOSIS',
            newStatus: 'IN_PROGRESS',
            changedById: 'user1'
          }]
        },
        progressLogs: {
          create: [{
            type: 'STATUS_CHANGE',
            message: expect.any(String),
            userId: 'user1'
          }]
        }
      })
    }));
  });

  it('rejects invalid statuses', async () => {
    await expect(vehicleService.updateVehicleStatus('v1', 'INVALID_STATUS', 'user1'))
      .rejects.toThrow('Invalid status');
  });

  it('rejects update if status is already the same', async () => {
    const mockVehicle = { id: 'v1', status: 'IN_PROGRESS' };
    prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);

    await expect(vehicleService.updateVehicleStatus('v1', 'IN_PROGRESS', 'user1'))
      .rejects.toThrow('Vehicle is already in status IN_PROGRESS');
  });
});

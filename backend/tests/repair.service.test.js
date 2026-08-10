const repairService = require('../src/services/repair.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Repair Workflow Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a repair task and assigns technician', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'tech1' });
    prisma.repair.create.mockResolvedValue({ id: 'rep1', description: 'Fix AC', technicianId: 'tech1', status: 'ASSIGNED' });
    prisma.progressLog.create.mockResolvedValue({});

    const result = await repairService.createRepair('v1', {
      description: 'Fix AC',
      technicianId: 'tech1'
    }, 'admin1');

    expect(prisma.repair.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        vehicleId: 'v1',
        description: 'Fix AC',
        technicianId: 'tech1',
        status: 'ASSIGNED'
      })
    }));

    expect(result.id).toBe('rep1');
  });

  it('allows technician to update their assigned repair', async () => {
    prisma.repair.findUnique.mockResolvedValue({ id: 'rep1', technicianId: 'tech1', status: 'ASSIGNED', vehicleId: 'v1' });
    prisma.repair.update.mockResolvedValue({ id: 'rep1', status: 'IN_PROGRESS' });
    prisma.progressLog.create.mockResolvedValue({});

    const result = await repairService.updateRepair('rep1', { status: 'IN_PROGRESS' }, { id: 'tech1', role: 'TECHNICIAN' });

    expect(prisma.repair.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'rep1' },
      data: expect.objectContaining({ status: 'IN_PROGRESS' })
    }));
  });

  it('rejects technician from updating an unassigned repair', async () => {
    prisma.repair.findUnique.mockResolvedValue({ id: 'rep1', technicianId: 'tech2', status: 'ASSIGNED' });

    await expect(repairService.updateRepair('rep1', { status: 'IN_PROGRESS' }, { id: 'tech1', role: 'TECHNICIAN' }))
      .rejects.toThrow('You do not have permission to update this repair task');
  });

  it('allows ADMIN to update any repair', async () => {
    prisma.repair.findUnique.mockResolvedValue({ id: 'rep1', technicianId: 'tech2', status: 'ASSIGNED', vehicleId: 'v1' });
    prisma.repair.update.mockResolvedValue({ id: 'rep1', status: 'COMPLETED' });

    await repairService.updateRepair('rep1', { status: 'COMPLETED' }, { id: 'admin1', role: 'ADMIN' });

    expect(prisma.repair.update).toHaveBeenCalled();
  });
});

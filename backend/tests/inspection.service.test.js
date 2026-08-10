const vehicleService = require('../src/services/vehicle.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Inspection & Diagnosis Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an inspection and automatically shifts status if awaiting diagnosis', async () => {
    const mockVehicle = {
      id: 'v1',
      status: 'AWAITING_DIAGNOSIS'
    };
    
    // We mock getVehicleById resolving twice: once before update, once after
    prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
    
    prisma.inspection.create.mockResolvedValue({ id: 'insp1' });
    prisma.progressLog.create.mockResolvedValue({});
    prisma.vehicle.update.mockResolvedValue({ ...mockVehicle, status: 'IN_PROGRESS' });

    const result = await vehicleService.addInspection('v1', {
      findings: 'Brake pads worn out',
      diagnosis: 'Needs new brake pads',
      recommendation: 'Replace front and rear pads'
    }, 'tech1');

    // Should create inspection
    expect(prisma.inspection.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        vehicleId: 'v1',
        technicianId: 'tech1',
        findings: 'Brake pads worn out'
      })
    });

    // Should create progress log
    expect(prisma.progressLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'DIAGNOSIS',
        userId: 'tech1'
      })
    });

    // Should update status from AWAITING_DIAGNOSIS to IN_PROGRESS
    expect(prisma.vehicle.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'v1' },
      data: expect.objectContaining({ status: 'IN_PROGRESS' })
    }));
  });

  it('updates an inspection', async () => {
    prisma.inspection.update.mockResolvedValue({ id: 'insp1', findings: 'Updated' });

    await vehicleService.updateInspection('insp1', {
      findings: 'Updated',
      technicianId: 'tech2'
    });

    expect(prisma.inspection.update).toHaveBeenCalledWith({
      where: { id: 'insp1' },
      data: expect.objectContaining({
        findings: 'Updated',
        technicianId: 'tech2'
      })
    });
  });

  it('gets inspections for a vehicle', async () => {
    prisma.inspection.findMany.mockResolvedValue([{ id: 'insp1' }]);

    const result = await vehicleService.getInspections('v1');
    
    expect(prisma.inspection.findMany).toHaveBeenCalledWith({
      where: { vehicleId: 'v1' },
      orderBy: { createdAt: 'desc' },
      include: { technician: { select: { name: true } } }
    });
    expect(result.length).toBe(1);
  });
});

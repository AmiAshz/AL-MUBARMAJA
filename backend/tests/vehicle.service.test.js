const vehicleService = require('../src/services/vehicle.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Returns the mock from setup

describe('Vehicle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Vehicle Creation & Rules', () => {
    it('creates a vehicle with a unique job number and no estimate required', async () => {
      // Mock generateJobNumber behavior (findFirst)
      prisma.vehicle.findFirst.mockResolvedValueOnce(null);
      
      const mockVehicle = {
        id: 'v1',
        jobNumber: 'VNT-000001',
        make: 'Toyota',
        model: 'Corolla',
        status: 'AWAITING_DIAGNOSIS'
      };

      prisma.vehicle.create.mockResolvedValueOnce(mockVehicle);

      const result = await vehicleService.createVehicle(
        { make: 'Toyota', model: 'Corolla', plateNumber: 'KA01AB1234', ownerName: 'John Doe' }, 
        [], 
        'user1'
      );

      expect(prisma.vehicle.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.vehicle.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          jobNumber: 'VNT-000001',
          make: 'Toyota',
          model: 'Corolla',
          plateNumber: 'KA01AB1234',
          ownerName: 'John Doe',
          status: 'AWAITING_DIAGNOSIS'
          // Notice we are NOT passing any estimate cost, proving it's not required
        })
      }));
      expect(result.jobNumber).toBe('VNT-000001');
    });
  });

  describe('Job Sheet Formatting Rules', () => {
    it('displays "NOT ESTIMATED" for a vehicle without an approved estimate', async () => {
      const mockVehicle = {
        id: 'v1',
        estimates: [{ status: 'DRAFT', total: 5000 }], // No approved estimate
        payments: [],
        finalTotalCost: null
      };

      prisma.vehicle.findUnique.mockResolvedValueOnce(mockVehicle);

      const jobSheet = await vehicleService.getJobSheet('v1');
      expect(jobSheet.financials.costStatus).toBe('NOT ESTIMATED');
      expect(jobSheet.financials.displayCost).toBe(0);
    });

    it('displays "ESTIMATED COST" and correctly isolates it from final cost if estimate approved', async () => {
      const mockVehicle = {
        id: 'v1',
        estimates: [{ status: 'APPROVED', total: 7500 }],
        payments: [],
        finalTotalCost: null
      };

      prisma.vehicle.findUnique.mockResolvedValueOnce(mockVehicle);

      const jobSheet = await vehicleService.getJobSheet('v1');
      expect(jobSheet.financials.costStatus).toBe('ESTIMATED COST');
      expect(jobSheet.financials.displayCost).toBe(7500);
      expect(jobSheet.financials.finalRepairCost).toBeNull();
    });

    it('displays "FINAL REPAIR COST" when job is complete and billed', async () => {
      const mockVehicle = {
        id: 'v1',
        estimates: [{ status: 'APPROVED', total: 7500 }],
        payments: [],
        finalTotalCost: 8000 // Actual final cost differs from estimate
      };

      prisma.vehicle.findUnique.mockResolvedValueOnce(mockVehicle);

      const jobSheet = await vehicleService.getJobSheet('v1');
      expect(jobSheet.financials.costStatus).toBe('FINAL REPAIR COST');
      expect(jobSheet.financials.displayCost).toBe(8000);
      expect(jobSheet.financials.finalRepairCost).toBe(8000);
    });
  });

  describe('CRUD & Search', () => {
    it('retrieves and filters vehicles', async () => {
      prisma.vehicle.findMany.mockResolvedValueOnce([{ id: 'v1' }]);
      prisma.vehicle.count.mockResolvedValueOnce(1);

      const result = await vehicleService.getAllVehicles(1, 10, 'Toyota', 'IN_PROGRESS');
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'IN_PROGRESS',
          OR: expect.any(Array)
        })
      }));
      expect(result.data.length).toBe(1);
    });
  });
});

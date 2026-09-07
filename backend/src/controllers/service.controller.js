const { PrismaClient } = require('@prisma/client');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

const getPublicServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, services, 'Services retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, services, 'All services retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const { nameAr, nameEn, descriptionAr, descriptionEn } = req.body;
    if (!nameAr || !nameEn || !descriptionAr || !descriptionEn) {
      throw new ApiError(400, 'All fields (nameAr, nameEn, descriptionAr, descriptionEn) are required.');
    }
    const service = await prisma.service.create({
      data: { nameAr, nameEn, descriptionAr, descriptionEn }
    });
    res.status(201).json(new ApiResponse(201, service, 'Service created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { nameAr, nameEn, descriptionAr, descriptionEn, isActive } = req.body;
    const { id } = req.params;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Service not found');
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        nameAr: nameAr !== undefined ? nameAr : existing.nameAr,
        nameEn: nameEn !== undefined ? nameEn : existing.nameEn,
        descriptionAr: descriptionAr !== undefined ? descriptionAr : existing.descriptionAr,
        descriptionEn: descriptionEn !== undefined ? descriptionEn : existing.descriptionEn,
        isActive: isActive !== undefined ? isActive : existing.isActive
      }
    });

    res.status(200).json(new ApiResponse(200, service, 'Service updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Service not found');
    }
    await prisma.service.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, 'Service deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicServices,
  getServices,
  createService,
  updateService,
  deleteService
};

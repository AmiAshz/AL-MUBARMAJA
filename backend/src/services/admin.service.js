const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

const prisma = new PrismaClient();

const VALID_ROLES = ['ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN', 'RECEPTIONIST'];

class AdminService {
  /**
   * List all employees with optional role / search filtering
   */
  static async getAllEmployees(query = {}) {
    const { role, status, search } = query;

    const where = {};

    if (role && VALID_ROLES.includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (status !== undefined && status !== '') {
      where.isActive = status === 'active' || status === 'true';
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } }
      ];
    }

    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            inspections: true,
            repairs: true,
            estimates: true,
            progressLogs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return employees;
  }

  /**
   * Get employee by ID
   */
  static async getEmployeeById(id) {
    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    return employee;
  }

  /**
   * Create a new employee account (Admin only)
   */
  static async createEmployee(data, adminUserId) {
    const { name, email, password, phone, role, isActive = true, emailVerified = true } = data;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required.');
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new ApiError(400, 'Invalid email address format.');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters.');
    }

    const assignedRole = (role || 'TECHNICIAN').toUpperCase();
    if (!VALID_ROLES.includes(assignedRole)) {
      throw new ApiError(400, `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`);
    }

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new ApiError(400, 'An employee account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const employee = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? String(phone).trim() : null,
        role: assignedRole,
        isActive: Boolean(isActive),
        emailVerified: Boolean(emailVerified)
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true
      }
    });

    return employee;
  }

  /**
   * Update employee details and role (Admin only)
   */
  static async updateEmployee(id, data, adminUserId) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Employee not found.');
    }

    const { name, email, phone, role, isActive, emailVerified } = data;

    // Safety: prevent demoting or deactivating the last remaining active Admin
    if (existing.role === 'ADMIN') {
      const willDemote = role && role.toUpperCase() !== 'ADMIN';
      const willDeactivate = isActive === false || isActive === 'false';

      if (willDemote || willDeactivate) {
        const activeAdminCount = await prisma.user.count({
          where: {
            role: 'ADMIN',
            isActive: true,
            id: { not: id }
          }
        });

        if (activeAdminCount === 0) {
          throw new ApiError(400, 'Cannot demote or deactivate the last remaining active Administrator.');
        }
      }
    }

    const updateData = {};

    if (name) updateData.name = String(name).trim();
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (emailVerified !== undefined) updateData.emailVerified = Boolean(emailVerified);

    if (role) {
      const assignedRole = role.toUpperCase();
      if (!VALID_ROLES.includes(assignedRole)) {
        throw new ApiError(400, `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`);
      }
      updateData.role = assignedRole;
    }

    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail !== existing.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          throw new ApiError(400, 'Invalid email address format.');
        }
        const duplicate = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (duplicate) {
          throw new ApiError(400, 'An employee account with this email already exists.');
        }
        updateData.email = cleanEmail;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updated;
  }

  /**
   * Toggle employee active status
   */
  static async toggleEmployeeStatus(id, isActive, adminUserId) {
    return this.updateEmployee(id, { isActive }, adminUserId);
  }

  /**
   * Reset employee password (Admin only)
   */
  static async resetEmployeePassword(id, newPassword, adminUserId) {
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters long.');
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Employee not found.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    return { success: true, message: 'Password updated successfully.' };
  }

  /**
   * Delete employee account (safely handles relations)
   */
  static async deleteEmployee(id, adminUserId) {
    const existing = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inspections: true,
            repairs: true,
            estimates: true,
            progressLogs: true
          }
        }
      }
    });

    if (!existing) {
      throw new ApiError(404, 'Employee not found.');
    }

    if (existing.role === 'ADMIN') {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
          isActive: true,
          id: { not: id }
        }
      });

      if (activeAdminCount === 0) {
        throw new ApiError(400, 'Cannot delete the only active Administrator.');
      }
    }

    // If user has linked audit/workshop records, perform soft deactivation to preserve history
    const totalActivity = (existing._count.inspections || 0) +
                          (existing._count.repairs || 0) +
                          (existing._count.estimates || 0) +
                          (existing._count.progressLogs || 0);

    if (totalActivity > 0) {
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });
      return { success: true, message: 'Employee has workshop activity and was safely deactivated.' };
    }

    // Clean up dependent tokens and delete
    await prisma.verificationToken.deleteMany({ where: { userId: id } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return { success: true, message: 'Employee deleted successfully.' };
  }
}

module.exports = AdminService;

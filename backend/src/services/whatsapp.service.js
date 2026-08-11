const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WhatsappService {
  /**
   * Get description for progress log based on notification type
   */
  static getProgressLogMessage(type) {
    switch (type) {
      case 'TRACKING_DETAILS':
        return 'Tracking details sent to customer via WhatsApp.';
      case 'REPAIR_COMPLETED':
        return 'Repair completion notification sent to customer via WhatsApp.';
      case 'READY_FOR_PICKUP':
        return 'Ready for pickup notification sent to customer via WhatsApp.';
      default:
        const formattedType = type.toLowerCase().replace(/_/g, ' ');
        const capitalized = formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
        return `${capitalized} notification sent to customer via WhatsApp.`;
    }
  }

  /**
   * Record that the user manually confirmed that the WhatsApp message was sent successfully
   */
  static async markSent(vehicleId, notificationType, userId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Create a new WhatsApp notification log directly marked SENT (as confirmed by staff)
    const notification = await prisma.whatsappNotification.create({
      data: {
        vehicleId,
        notificationType,
        recipientPhone: vehicle.ownerPhone || '',
        status: 'SENT',
        sentById: userId,
        sentAt: new Date()
      }
    });

    // Add to vehicle's immutable progress logs (activity logs)
    const progressLogMsg = this.getProgressLogMessage(notificationType);
    await prisma.progressLog.create({
      data: {
        vehicleId,
        type: 'STATUS_CHANGE',
        message: progressLogMsg,
        isCustomerVisible: false,
        userId
      }
    });

    return { success: true, notificationId: notification.id };
  }
}

module.exports = WhatsappService;

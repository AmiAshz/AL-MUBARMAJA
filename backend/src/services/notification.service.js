const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationService {
  /**
   * Helper to write initial PENDING notification record, mock send it, and update status.
   */
  static async sendNotification(vehicleId, phoneNumber, messageType, messageContent) {
    const provider = process.env.NOTIFICATION_PROVIDER || 'sms';

    // 1. Create a notification record in status PENDING
    const notification = await prisma.notification.create({
      data: {
        vehicleId,
        phoneNumber,
        messageType,
        provider,
        status: 'PENDING'
      }
    });

    try {
      // 2. Perform the send logic based on provider
      let providerMessageId = null;

      if (provider === 'sms') {
        providerMessageId = await this.mockSendSMS(phoneNumber, messageContent);
      } else if (provider === 'whatsapp') {
        providerMessageId = await this.mockSendWhatsApp(phoneNumber, messageContent);
      } else {
        throw new Error(`Unsupported notification provider: ${provider}`);
      }

      // 3. Update notification to SENT on success
      return await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          providerMessageId,
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error(`[NOTIFICATION ERROR] Failed to send to ${phoneNumber} via ${provider}:`, error);

      // 4. Update notification to FAILED on error
      return await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          failureReason: error.message || 'Unknown provider error'
        }
      });
    }
  }

  /**
   * Mock SMS sender
   */
  static async mockSendSMS(phoneNumber, messageContent) {
    console.log('\n--- [MOCK SMS DISPATCH] ---');
    console.log(`To:      ${phoneNumber}`);
    console.log(`Content:\n${messageContent}`);
    console.log('---------------------------\n');
    
    // Simulate slight network delay & success
    return `msg_sms_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }

  /**
   * Mock WhatsApp sender
   */
  static async mockSendWhatsApp(phoneNumber, messageContent) {
    console.log('\n--- [MOCK WHATSAPP DISPATCH] ---');
    console.log(`To:      ${phoneNumber}`);
    console.log(`Content:\n${messageContent}`);
    console.log('--------------------------------\n');
    
    // Simulate success
    return `msg_wa_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }

  /**
   * VEHICLE_REGISTERED message helper
   */
  static async sendVehicleTrackingMessage(vehicle, trackingCode) {
    const trackingUrl = process.env.CUSTOMER_TRACKING_URL || 'http://localhost:3000/track';
    
    const messageContent = `VANTARA — The Journey Behind Every Repair\n\n` +
      `Your vehicle has been registered with our workshop.\n\n` +
      `Vehicle: ${vehicle.make} ${vehicle.model}\n` +
      `Registration: ${vehicle.plateNumber}\n\n` +
      `Track your vehicle:\n` +
      `${trackingUrl}\n\n` +
      `Your Tracking Code:\n` +
      `${trackingCode}\n\n` +
      `Use your Tracking Code and registered phone number to check your vehicle's repair status.\n\n` +
      `Please keep this code private.\n\n` +
      `— VANTARA`;

    return await this.sendNotification(
      vehicle.id,
      vehicle.ownerPhone,
      'VEHICLE_REGISTERED',
      messageContent
    );
  }

  /**
   * ESTIMATE_READY message helper
   */
  static async sendEstimateMessage(vehicle, total) {
    const trackingUrl = process.env.CUSTOMER_TRACKING_URL || 'http://localhost:3000/track';
    const fmtC = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

    const messageContent = `VANTARA — Repair Estimate Ready\n\n` +
      `A repair estimate has been prepared for your ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}).\n\n` +
      `Estimated Amount: ${fmtC(total)}\n\n` +
      `Please visit the link to review and approve the estimate:\n` +
      `${trackingUrl}\n\n` +
      `— VANTARA`;

    return await this.sendNotification(
      vehicle.id,
      vehicle.ownerPhone,
      'ESTIMATE_READY',
      messageContent
    );
  }

  /**
   * REPAIR_UPDATE / milestone progress log updates
   */
  static async sendMilestoneMessage(vehicle, milestoneType, customMessage) {
    let type = 'REPAIR_UPDATE';
    if (milestoneType === 'VEHICLE_RECEIVED') type = 'VEHICLE_RECEIVED';
    else if (milestoneType === 'DIAGNOSIS' || milestoneType === 'DIAGNOSIS_COMPLETED') type = 'DIAGNOSIS_COMPLETED';
    else if (milestoneType === 'ESTIMATE_READY') type = 'ESTIMATE_READY';
    else if (milestoneType === 'IN_PROGRESS' || milestoneType === 'REPAIR_STARTED') type = 'REPAIR_STARTED';
    else if (milestoneType === 'AWAITING_PARTS') type = 'AWAITING_PARTS';
    else if (milestoneType === 'READY_FOR_PICKUP') type = 'READY_FOR_PICKUP';
    else if (milestoneType === 'COMPLETED' || milestoneType === 'VEHICLE_COMPLETED') type = 'VEHICLE_COMPLETED';

    const messageContent = `VANTARA — Status Update\n\n` +
      `Update for your vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})\n\n` +
      `Status: ${customMessage}\n\n` +
      `Track the complete repair journey live:\n` +
      `${process.env.CUSTOMER_TRACKING_URL || 'http://localhost:3000/track'}\n\n` +
      `— VANTARA`;

    return await this.sendNotification(
      vehicle.id,
      vehicle.ownerPhone,
      type,
      messageContent
    );
  }

  /**
   * VEHICLE_COMPLETED / completion notification helper
   */
  static async sendCompletionMessage(vehicle) {
    const trackingUrl = process.env.CUSTOMER_TRACKING_URL || 'http://localhost:3000/track';
    
    const messageContent = `VANTARA — The Journey Behind Every Repair\n\n` +
      `Your vehicle repair has been completed.\n\n` +
      `Vehicle: ${vehicle.make} ${vehicle.model}\n` +
      `Registration: ${vehicle.plateNumber}\n\n` +
      `Your vehicle is now ready for collection.\n\n` +
      `Track your vehicle:\n` +
      `${trackingUrl}\n\n` +
      `Thank you for choosing VANTARA.\n\n` +
      `— VANTARA`;

    return await this.sendNotification(
      vehicle.id,
      vehicle.ownerPhone,
      'VEHICLE_COMPLETED',
      messageContent
    );
  }
}

module.exports = NotificationService;

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
    const link = `${trackingUrl}?code=${trackingCode}&phone=${encodeURIComponent(vehicle.ownerPhone)}`;

    const messageContent = `ورشة المبرمج\n\n` +
      `تم تسجيل مركبتك لدى الورشة بنجاح.\n\n` +
      `المركبة:\n${vehicle.make} ${vehicle.model}\n\n` +
      `رقم اللوحة:\n${vehicle.plateNumber}\n\n` +
      `رمز التتبع الخاص بك:\n${trackingCode}\n\n` +
      `يمكنك متابعة حالة مركبتك من خلال:\n${link}\n\n` +
      `استخدم رمز التتبع ورقم الجوال المسجل لمتابعة حالة مركبتك.\n\n` +
      `شكراً لاختياركم ورشة المبرمج.`;

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

    const messageContent = `ورشة المبرمج\n\n` +
      `تم إعداد تقدير تكلفة الإصلاح لمركبتك ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}).\n\n` +
      `التكلفة التقديرية: ${total.toFixed(2)} ر.س\n\n` +
      `يرجى زيارة الرابط للمراجعة والموافقة:\n` +
      `${trackingUrl}\n\n` +
      `شكراً لاختياركم ورشة المبرمج.`;

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

    const messageContent = `ورشة المبرمج\n\n` +
      `تحديث لحالة مركبتك: ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})\n\n` +
      `الحالة: ${customMessage}\n\n` +
      `تابع سير الإصلاح مباشرة عبر الرابط:\n` +
      `${process.env.CUSTOMER_TRACKING_URL || 'http://localhost:3000/track'}\n\n` +
      `شكراً لاختياركم ورشة المبرمج.`;

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
    
    const messageContent = `ورشة المبرمج\n\n` +
      `تم الانتهاء من إصلاح مركبتك.\n\n` +
      `المركبة:\n${vehicle.make} ${vehicle.model}\n\n` +
      `رقم اللوحة:\n${vehicle.plateNumber}\n\n` +
      `مركبتك جاهزة للاستلام.\n\n` +
      `لمتابعة حالة مركبتك:\n${trackingUrl}\n\n` +
      `شكراً لاختياركم ورشة المبرمج.`;

    return await this.sendNotification(
      vehicle.id,
      vehicle.ownerPhone,
      'VEHICLE_COMPLETED',
      messageContent
    );
  }
}

module.exports = NotificationService;

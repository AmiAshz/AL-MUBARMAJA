const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const templates = require('../utils/emailTemplates');

const resendApiKey = process.env.RESEND_API_KEY;
const isMockMode = !resendApiKey || resendApiKey === 'your_resend_api_key';

class EmailService {
  /**
   * Internal reusable method to send an email using the Resend REST API.
   * Handles database logging (EmailLog), error parsing, and rate-limits.
   */
  static async sendEmail({ recipientEmail, subject, html, emailType, vehicleId = null, customerId = null, sentById = null, language = 'en' }) {
    // 1. Create a PENDING log in the database
    const log = await prisma.emailLog.create({
      data: {
        recipientEmail,
        subject,
        emailType,
        language,
        vehicleId,
        customerId,
        sentById,
        status: 'PENDING'
      }
    });

    try {
      let resendEmailId = null;

      if (isMockMode) {
        console.log(`\n--- [MOCK EMAIL DISPATCH] ---`);
        console.log(`To:      ${recipientEmail}`);
        console.log(`Type:    ${emailType}`);
        console.log(`Subject: ${subject}`);
        console.log(`-----------------------------\n`);
        resendEmailId = `mock_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      } else {
        const fromEmail = process.env.EMAIL_FROM || 'Workshop Name <onboarding@resend.dev>';
        
        // Use native fetch to POST to Resend REST API
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [recipientEmail],
            subject: subject,
            html: html
          })
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle 400, 401, 403, 429, 500 errors gracefully
          throw new Error(data.message || `Resend API Error: ${response.status} ${response.statusText}`);
        }

        resendEmailId = data.id;
      }

      // 2. Update status to SENT
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          resendEmailId,
          sentAt: new Date()
        }
      });

      return { success: true, messageId: resendEmailId };
    } catch (error) {
      console.error(`[EMAIL ERROR] Failed to send ${emailType} email to ${recipientEmail}:`, error);

      // 3. Update status to FAILED
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Unknown sending failure'
        }
      });

      // Return clean response instead of throwing to prevent crashing the flow
      return { success: false, error: error.message };
    }
  }

  // -----------------------------------------------------------------------------
  // AUTHENTICATION EMAILS
  // -----------------------------------------------------------------------------

  static async sendVerificationEmail(user, token, language = 'en') {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/verify-email?token=${token}`;
    const subject = language === 'ar' ? 'تأكيد البريد الإلكتروني – المبرمج' : 'Verify Your Email – AL Mubarmaja';
    
    const html = templates.verificationEmail(user.name, link, language);
    
    return this.sendEmail({
      recipientEmail: user.email,
      subject,
      emailType: 'EMAIL_VERIFICATION',
      html,
      language,
      customerId: user.id
    });
  }

  static async sendPasswordResetEmail(user, token, language = 'en') {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/reset-password?token=${token}`;
    const subject = language === 'ar' ? 'إعادة تعيين كلمة المرور – المبرمج' : 'Forgot Password? – AL Mubarmaja';

    const html = templates.passwordResetEmail(user.name, link, language);

    return this.sendEmail({
      recipientEmail: user.email,
      subject,
      emailType: 'PASSWORD_RESET',
      html,
      language,
      customerId: user.id
    });
  }

  // -----------------------------------------------------------------------------
  // VEHICLE WORKFLOW EMAILS
  // -----------------------------------------------------------------------------

  // 28. EMAIL — TRACKING DETAILS
  static async sendTrackingDetails(vehicle, recipientEmail, sentById, language = 'en') {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/track`;
    const subject = language === 'ar' 
      ? 'تم تسجيل مركبتك – المبرمج' 
      : 'Your Vehicle Has Been Registered – AL Mubarmaja';

    const html = templates.trackingDetailsEmail(vehicle, link, language);

    return this.sendEmail({
      recipientEmail,
      subject,
      emailType: 'TRACKING_DETAILS',
      html,
      language,
      vehicleId: vehicle.id,
      sentById
    });
  }

  // 25 / Status Update Email
  static async sendStatusUpdate(vehicle, recipientEmail, sentById, language = 'en') {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/track`;
    const subject = language === 'ar' 
      ? `تحديث حالة المركبة – المبرمج` 
      : `Vehicle Status Update – AL Mubarmaja`;

    const html = templates.statusUpdateEmail(vehicle, link, language);

    return this.sendEmail({
      recipientEmail,
      subject,
      emailType: 'STATUS_UPDATE',
      html,
      language,
      vehicleId: vehicle.id,
      sentById
    });
  }

  // 26 / Pickup Notification Email
  static async sendPickupNotification(vehicle, recipientEmail, sentById, language = 'en') {
    const subject = language === 'ar' 
      ? `مركبتك جاهزة للاستلام – المبرمج` 
      : `Your Vehicle is Ready for Pickup – AL Mubarmaja`;

    const html = templates.pickupNotificationEmail(vehicle, language);

    return this.sendEmail({
      recipientEmail,
      subject,
      emailType: 'READY_FOR_PICKUP',
      html,
      language,
      vehicleId: vehicle.id,
      sentById
    });
  }

  // 29. EMAIL — REPAIR COMPLETED
  static async sendCompletionNotification(vehicle, recipientEmail, sentById, language = 'en') {
    const subject = language === 'ar' 
      ? 'تم الانتهاء من إصلاح مركبتك – المبرمج' 
      : 'Your Vehicle Repair Is Complete – AL Mubarmaja';

    const html = templates.completionNotificationEmail(vehicle, language);

    return this.sendEmail({
      recipientEmail,
      subject,
      emailType: 'REPAIR_COMPLETED',
      html,
      language,
      vehicleId: vehicle.id,
      sentById
    });
  }
}

module.exports = EmailService;

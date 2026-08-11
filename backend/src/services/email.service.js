const { Resend } = require('resend');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const templates = require('../utils/emailTemplates');

const resendApiKey = process.env.RESEND_API_KEY;
const isMockMode = !resendApiKey || resendApiKey === 'your_resend_api_key';

let resend = null;
if (!isMockMode) {
  resend = new Resend(resendApiKey);
}

class EmailService {
  static async sendEmail({ userId, recipient, type, subject, html }) {
    const provider = isMockMode ? 'mock' : 'resend';
    
    // 1. Create email log in PENDING status
    const log = await prisma.emailLog.create({
      data: {
        userId,
        recipient,
        type,
        provider,
        status: 'PENDING'
      }
    });

    try {
      let providerMessageId = null;

      if (isMockMode) {
        // Extract link from HTML for easy clicking in development terminal
        const urlMatch = html.match(/href="([^"]+)"/);
        const link = urlMatch ? urlMatch[1] : 'N/A';

        // Mock email delivery
        console.log(`\n--- [MOCK EMAIL DISPATCH] ---`);
        console.log(`To:      ${recipient}`);
        console.log(`Type:    ${type}`);
        console.log(`Subject: ${subject}`);
        console.log(`Link:    ${link}`);
        console.log(`-----------------------------\n`);
        providerMessageId = `msg_mock_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      } else {
        const fromEmail = process.env.EMAIL_FROM || 'VANTARA <onboarding@resend.dev>';
        const response = await resend.emails.send({
          from: fromEmail,
          to: recipient,
          subject,
          html
        });

        if (response.error) {
          throw new Error(response.error.message || 'Resend API returned an error');
        }

        providerMessageId = response.data ? response.data.id : null;
      }

      // 2. Update status to SENT
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          providerMessageId,
          sentAt: new Date()
        }
      });

      return { success: true, messageId: providerMessageId };
    } catch (error) {
      console.error(`[EMAIL ERROR] Failed to send ${type} email to ${recipient}:`, error);

      // 3. Update status to FAILED
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          failureReason: error.message || 'Unknown sending failure'
        }
      });

      // Do NOT throw error so registration/reset flows don't crash, just log and return false
      return { success: false, error: error.message };
    }
  }

  static async sendVerificationEmail(user, token) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/verify-email?token=${token}`;
    const html = templates.verificationEmail(user.name, link, 15); // 15 mins expiration
    
    return this.sendEmail({
      userId: user.id,
      recipient: user.email,
      type: 'VERIFICATION',
      subject: 'Verify your VANTARA account',
      html
    });
  }

  static async sendPasswordResetEmail(user, token) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/reset-password?token=${token}`;
    const html = templates.passwordResetEmail(user.name, link, 15); // 15 mins expiration

    return this.sendEmail({
      userId: user.id,
      recipient: user.email,
      type: 'PASSWORD_RESET',
      subject: 'Reset your VANTARA password',
      html
    });
  }

  static async sendWelcomeEmail(user) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/login`;
    const html = templates.welcomeEmail(user.name, link);

    return this.sendEmail({
      userId: user.id,
      recipient: user.email,
      type: 'WELCOME',
      subject: 'Welcome to VANTARA',
      html
    });
  }

  static async sendAccountInvitationEmail(email, role, token) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/verify-email?token=${token}`;
    const html = templates.accountInvitationEmail(role, link);

    return this.sendEmail({
      recipient: email,
      type: 'INVITATION',
      subject: "You've been invited to VANTARA",
      html
    });
  }
}

module.exports = EmailService;

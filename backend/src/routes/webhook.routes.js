const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

/**
 * POST /api/webhooks/resend
 * Handles Resend webhook notifications for email delivery tracking
 */
router.post('/resend', async (req, res, next) => {
  try {
    const payload = req.body;
    
    // Check if it's a valid Resend webhook payload
    if (!payload || !payload.type || !payload.data) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const eventType = payload.type;
    const emailId = payload.data.email_id || payload.data.id;

    if (!emailId) {
      return res.status(400).json({ success: false, message: 'Email ID missing in event data' });
    }

    console.log(`[RESEND WEBHOOK] Received event "${eventType}" for email "${emailId}"`);

    // Find the corresponding email log
    const emailLog = await prisma.emailLog.findFirst({
      where: { providerMessageId: emailId }
    });

    if (!emailLog) {
      // Return 200 even if log is not found so Resend doesn't keep retrying
      return res.status(200).json({ success: true, message: 'Email log not found, ignoring event' });
    }

    let status = emailLog.status;
    let failureReason = emailLog.failureReason;

    switch (eventType) {
      case 'email.sent':
        status = 'SENT';
        break;
      case 'email.delivered':
        status = 'DELIVERED';
        break;
      case 'email.bounced':
        status = 'BOUNCED';
        failureReason = payload.data.reason || 'Email bounced by recipient mail server';
        break;
      case 'email.complained':
        status = 'COMPLAINED';
        failureReason = 'Recipient marked the email as spam';
        break;
      case 'email.failed':
        status = 'FAILED';
        failureReason = payload.data.error || 'Delivery failed';
        break;
      default:
        console.log(`[RESEND WEBHOOK] Unhandled event type: ${eventType}`);
    }

    // Update the log in database
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status,
        failureReason,
        sentAt: eventType === 'email.sent' || eventType === 'email.delivered' ? new Date() : emailLog.sentAt
      }
    });

    return res.status(200).json({ success: true, message: 'Email log updated' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

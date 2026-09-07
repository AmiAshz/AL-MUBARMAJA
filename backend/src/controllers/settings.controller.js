const { PrismaClient } = require('@prisma/client');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const EmailService = require('../services/email.service');

const prisma = new PrismaClient();

const getPublicSettings = async (req, res, next) => {
  try {
    let settings = await prisma.workshopSettings.findFirst();
    if (!settings) {
      // Create defaults if not exists
      settings = await prisma.workshopSettings.create({
        data: {
          nameAr: "المبرمج",
          nameEn: "AL Mubarmaja",
          phone: "+966 55 885 2934",
          email: "",
          addressAr: "المحالة، أبها، المملكة العربية السعودية",
          addressEn: "Almahalah, Abha, Saudi Arabia",
          googleMapsUrl: "https://maps.google.com/?q=18.2410405,42.5722994",
          latitude: 18.2410405,
          longitude: 42.5722994
        }
      });
    }
    res.status(200).json(new ApiResponse(200, settings, 'Settings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { nameAr, nameEn, phone, email, addressAr, addressEn, googleMapsUrl, latitude, longitude } = req.body;
    let settings = await prisma.workshopSettings.findFirst();
    
    const updateData = {
      nameAr: nameAr !== undefined ? nameAr : (settings ? settings.nameAr : "المبرمج"),
      nameEn: nameEn !== undefined ? nameEn : (settings ? settings.nameEn : "AL Mubarmaja"),
      phone: phone !== undefined ? phone : (settings ? settings.phone : "+966 55 885 2934"),
      email: email !== undefined ? email : (settings ? settings.email : ""),
      addressAr: addressAr !== undefined ? addressAr : (settings ? settings.addressAr : "المحالة، أبها، المملكة العربية السعودية"),
      addressEn: addressEn !== undefined ? addressEn : (settings ? settings.addressEn : "Almahalah, Abha, Saudi Arabia"),
      googleMapsUrl: googleMapsUrl !== undefined ? googleMapsUrl : (settings ? settings.googleMapsUrl : "https://maps.google.com/?q=18.2410405,42.5722994"),
      latitude: latitude !== undefined ? parseFloat(latitude) : (settings ? settings.latitude : 18.2410405),
      longitude: longitude !== undefined ? parseFloat(longitude) : (settings ? settings.longitude : 42.5722994)
    };

    if (!settings) {
      settings = await prisma.workshopSettings.create({ data: updateData });
    } else {
      settings = await prisma.workshopSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    }

    res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully'));
  } catch (error) {
    next(error);
  }
};

const getEmailStatus = async (req, res, next) => {
  try {
    const isConfigured = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key';
    res.status(200).json(new ApiResponse(200, { configured: isConfigured }, 'Email configuration status retrieved'));
  } catch (error) {
    next(error);
  }
};

const sendTestEmail = async (req, res, next) => {
  try {
    const isConfigured = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key';
    if (!isConfigured) {
      throw new ApiError(400, 'Resend API key is not configured');
    }

    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Test email address is required');
    }

    const { workshopNotificationEmail } = require('../utils/emailTemplates');
    const html = workshopNotificationEmail('Test Email Successful', 'Your Resend REST API integration is working correctly.');

    const result = await EmailService.sendEmail({
      recipientEmail: email,
      subject: 'VANTARA Test Email',
      html,
      emailType: 'WELCOME',
      sentById: req.user.id
    });

    if (!result.success) {
      throw new ApiError(400, result.error);
    }

    res.status(200).json(new ApiResponse(200, result, 'Test email sent successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSettings,
  updateSettings,
  getEmailStatus,
  sendTestEmail
};

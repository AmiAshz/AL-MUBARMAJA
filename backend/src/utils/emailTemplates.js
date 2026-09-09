const baseTemplate = (contentHtml, language = 'en') => {
  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const langAttr = isRtl ? 'ar' : 'en';

  return `
<!DOCTYPE html>
<html lang="${langAttr}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <title>${isRtl ? 'المبرمج' : 'AL Mubarmaja'}</title>
  <style>
    body {
      background-color: #F4F8EF;
      color: #1a1a1a;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      direction: ${dir};
      text-align: ${isRtl ? 'right' : 'left'};
    }
    .wrapper {
      background-color: #F4F8EF;
      padding: 40px 20px;
    }
    .container {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #3D5A0E;
      padding-bottom: 20px;
    }
    .logo {
      color: #3D5A0E;
      font-size: 26px;
      font-weight: 800;
      text-decoration: none;
    }
    .tagline {
      color: #64748b;
      font-size: 12px;
      margin-top: 4px;
    }
    .content {
      font-size: 15px;
      line-height: 1.6;
      color: #333333;
    }
    h1 {
      color: #1a1a1a;
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 20px;
    }
    p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .details-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .details-row {
      margin-bottom: 10px;
    }
    .details-label {
      font-weight: 600;
      color: #64748b;
      font-size: 14px;
    }
    .details-value {
      font-weight: 700;
      color: #0f172a;
    }
    .tracking-code {
      display: inline-block;
      background-color: #e2e8f0;
      padding: 8px 16px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #3D5A0E;
      margin-top: 5px;
      direction: ltr !important;
    }
    .ltr-text {
      direction: ltr !important;
      display: inline-block;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      background-color: #3D5A0E;
      color: #ffffff !important;
      display: inline-block;
      font-size: 14px;
      font-weight: bold;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
    }
    .footer {
      color: #64748b;
      font-size: 12px;
      margin-top: 35px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      text-align: center;
      line-height: 1.5;
    }
    .footer-brand {
      color: #3D5A0E;
      font-weight: bold;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">${isRtl ? 'المبرمج' : 'AL Mubarmaja'}</div>
        <div class="tagline">${isRtl ? 'عناية تتواجد مع كل عملية إصلاح.' : 'Care Behind Every Repair.'}</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <div class="footer-brand">${isRtl ? 'المبرمج' : 'AL Mubarmaja'}</div>
        <div>${isRtl ? 'صيانة وتشخيص وإصلاح المركبات باحترافية' : 'Professional Vehicle Maintenance, Diagnosis & Repair'}</div>
        <div style="margin-top: 8px; font-size: 11px;">${isRtl ? '©️ 2026 المبرمج. جميع الحقوق محفوظة.' : '©️ 2026 AL Mubarmaja. All rights reserved.'}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// -----------------------------------------------------------------------------
// 13. AUTHENTICATION & VERIFICATION EMAILS
// -----------------------------------------------------------------------------

const verificationEmail = (name, url, language = 'en') => {
  const isRtl = language === 'ar';
  return baseTemplate(`
    <h1>${isRtl ? 'تأكيد البريد الإلكتروني' : 'Verify Your Email'}</h1>
    <p>${isRtl ? 'مرحباً' : 'Hello'} ${name},</p>
    <p>${isRtl ? 'لقد أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد والضغط على زر التحقق لتفعيل حسابك.' : "We've sent a verification link to your email address. Please check your inbox and click the verification button to activate your account."}</p>
    <div class="cta-container">
      <a href="${url}" class="btn" target="_blank">${isRtl ? 'تأكيد البريد الإلكتروني' : 'Verify Email'}</a>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
      ${isRtl ? 'لم تصلك الرسالة؟ يمكنك إعادة إرسال رسالة التحقق من صفحة تسجيل الدخول.' : "Didn't receive the email? You can resend the verification email from the login page."}
    </p>
  `, language);
};

const passwordResetEmail = (name, url, language = 'en') => {
  const isRtl = language === 'ar';
  return baseTemplate(`
    <h1>${isRtl ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?'}</h1>
    <p>${isRtl ? 'مرحباً' : 'Hello'} ${name},</p>
    <p>${isRtl ? 'أدخلت بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' : 'Enter your email address and we will send you a link to reset your password.'}</p>
    <div class="cta-container">
      <a href="${url}" class="btn" target="_blank">${isRtl ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}</a>
    </div>
  `, language);
};

const welcomeEmail = (name, language = 'en') => {
  const isRtl = language === 'ar';
  return baseTemplate(`
    <h1>${isRtl ? 'مرحباً بك في المبرمج' : 'Welcome to AL Mubarmaja'}</h1>
    <p>${isRtl ? 'مرحباً' : 'Hello'} ${name},</p>
    <p>${isRtl ? 'تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول والبدء في استخدام منصة إدارة الورشة.' : 'Your account has been successfully verified and activated. You can now log in and manage workshop operations.'}</p>
    <p style="margin-top: 25px;">${isRtl ? 'شكراً لاختيارك المبرمج.' : 'Thank you for choosing AL Mubarmaja.'}</p>
  `, language);
};

// -----------------------------------------------------------------------------
// 28. EMAIL — TRACKING DETAILS
// -----------------------------------------------------------------------------

const trackingDetailsEmail = (vehicle, url, language = 'en') => {
  const isRtl = language === 'ar';
  return baseTemplate(`
    <h1>${isRtl ? 'تم تسجيل مركبتك – المبرمج' : 'Your Vehicle Has Been Registered – AL Mubarmaja'}</h1>
    <p>${isRtl ? 'مرحباً' : 'Hello'} ${vehicle.ownerName || 'العميل'},</p>
    <p>${isRtl ? 'تم تسجيل مركبتك بنجاح لدى ورشة المبرمج.' : 'Your vehicle has been successfully registered at AL Mubarmaja.'}</p>
    
    <div class="details-box">
      <div class="details-row">
        <span class="details-label">${isRtl ? 'المركبة:' : 'Vehicle:'}</span>
        <span class="details-value">${vehicle.make} ${vehicle.model}</span>
      </div>
      <div class="details-row">
        <span class="details-label">${isRtl ? 'رقم اللوحة:' : 'Registration:'}</span>
        <span class="details-value ltr-text">${vehicle.plateNumber}</span>
      </div>
      <div class="details-row" style="margin-top: 15px;">
        <span class="details-label" style="display:block; margin-bottom:5px;">${isRtl ? 'رمز التتبع:' : 'Tracking Code:'}</span>
        <div style="${isRtl ? 'text-align: right;' : 'text-align: left;'}"><span class="tracking-code">${vehicle.trackingCode}</span></div>
      </div>
    </div>

    <p>${isRtl ? 'يمكنك متابعة حالة إصلاح مركبتك من خلال الرابط أدناه.' : 'You can follow your vehicle’s repair progress using the link below.'}</p>

    <div class="cta-container">
      <a href="${url}" class="btn" target="_blank">${isRtl ? 'تتبع مركبتك' : 'Track Your Vehicle'}</a>
    </div>
    
    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
      ${isRtl ? 'يرجى الاحتفاظ برمز التتبع الخاص بك.' : 'Please keep your tracking code safe.'}
    </p>
    <p>${isRtl ? 'شكراً لك،<br>المبرمج' : 'Thank you,<br>AL Mubarmaja'}</p>
  `, language);
};

// -----------------------------------------------------------------------------
// 29. EMAIL — REPAIR COMPLETED
// -----------------------------------------------------------------------------

const completionNotificationEmail = (vehicle, language = 'en') => {
  const isRtl = language === 'ar';
  return baseTemplate(`
    <h1>${isRtl ? 'تم الانتهاء من إصلاح مركبتك – المبرمج' : 'Your Vehicle Repair Is Complete – AL Mubarmaja'}</h1>
    <p>${isRtl ? 'مرحباً' : 'Hello'} ${vehicle.ownerName || 'العميل'},</p>
    <p>${isRtl ? 'يسرنا إبلاغك بأنه تم الانتهاء من أعمال إصلاح مركبتك.' : 'We are pleased to inform you that the repair work on your vehicle has been completed.'}</p>
    
    <div class="details-box">
      <div class="details-row">
        <span class="details-label">${isRtl ? 'المركبة:' : 'Vehicle:'}</span>
        <span class="details-value">${vehicle.make} ${vehicle.model}</span>
      </div>
      <div class="details-row">
        <span class="details-label">${isRtl ? 'رقم اللوحة:' : 'Registration:'}</span>
        <span class="details-value ltr-text">${vehicle.plateNumber}</span>
      </div>
    </div>

    <p>${isRtl ? 'مركبتك الآن جاهزة للاستلام.' : 'Your vehicle is ready for collection.'}</p>
    <p>${isRtl ? 'لمزيد من المعلومات، يرجى التواصل مع الورشة.' : 'For more information, please contact our workshop.'}</p>

    <p style="margin-top: 25px;">${isRtl ? 'شكراً لاختيارك المبرمج.' : 'Thank you for choosing AL Mubarmaja.'}</p>
  `, language);
};

const statusUpdateEmail = (vehicle, url, language = 'en') => {
  const isRtl = language === 'ar';
  return baseTemplate(`
    <h1>${isRtl ? 'تحديث حالة المركبة – المبرمج' : 'Vehicle Status Update – AL Mubarmaja'}</h1>
    <p>${isRtl ? 'مرحباً' : 'Hello'} ${vehicle.ownerName || 'العميل'},</p>
    <p>${isRtl ? 'إليك تحديثاً بشأن مركبتك.' : 'Here is an update regarding your vehicle.'}</p>
    
    <div class="details-box">
      <div class="details-row">
        <span class="details-label">${isRtl ? 'المركبة:' : 'Vehicle:'}</span>
        <span class="details-value">${vehicle.make} ${vehicle.model}</span>
      </div>
      <div class="details-row">
        <span class="details-label">${isRtl ? 'الحالة الحالية:' : 'Current Status:'}</span>
        <span class="details-value">${vehicle.status}</span>
      </div>
      <div class="details-row">
        <span class="details-label">${isRtl ? 'رمز التتبع:' : 'Tracking Code:'}</span>
        <span class="details-value ltr-text">${vehicle.trackingCode}</span>
      </div>
    </div>

    <div class="cta-container">
      <a href="${url}" class="btn" target="_blank">${isRtl ? 'تتبع مركبتك' : 'Track Your Vehicle'}</a>
    </div>
    <p>${isRtl ? 'شكراً لك،<br>المبرمج' : 'Thank you,<br>AL Mubarmaja'}</p>
  `, language);
};

const pickupNotificationEmail = (vehicle, language = 'en') => {
  const isRtl = language === 'ar';
  return baseTemplate(`
    <h1>${isRtl ? 'مركبتك جاهزة للاستلام – المبرمج' : 'Your Vehicle is Ready for Pickup – AL Mubarmaja'}</h1>
    <p>${isRtl ? 'مرحباً' : 'Hello'} ${vehicle.ownerName || 'العميل'},</p>
    <p>${isRtl ? 'مركبتك الآن جاهزة للاستلام.' : 'Your vehicle is now ready for pickup.'}</p>
    
    <div class="details-box">
      <div class="details-row">
        <span class="details-label">${isRtl ? 'المركبة:' : 'Vehicle:'}</span>
        <span class="details-value">${vehicle.make} ${vehicle.model}</span>
      </div>
      <div class="details-row">
        <span class="details-label">${isRtl ? 'رقم اللوحة:' : 'Registration:'}</span>
        <span class="details-value ltr-text">${vehicle.plateNumber}</span>
      </div>
      <div class="details-row">
        <span class="details-label">${isRtl ? 'رمز التتبع:' : 'Tracking Code:'}</span>
        <span class="details-value ltr-text">${vehicle.trackingCode}</span>
      </div>
    </div>

    <p>${isRtl ? 'يرجى التواصل مع ورشة المبرمج لمعرفة تفاصيل الاستلام.' : 'Please contact AL Mubarmaja for pickup details.'}</p>
    <p>${isRtl ? 'شكراً لك،<br>المبرمج' : 'Thank you,<br>AL Mubarmaja'}</p>
  `, language);
};

const workshopNotificationEmail = (title, message, language = 'en') => {
  return baseTemplate(`
    <h1>${title}</h1>
    <p>${message}</p>
  `, language);
};

module.exports = {
  verificationEmail,
  welcomeEmail,
  passwordResetEmail,
  trackingDetailsEmail,
  statusUpdateEmail,
  pickupNotificationEmail,
  completionNotificationEmail,
  workshopNotificationEmail
};

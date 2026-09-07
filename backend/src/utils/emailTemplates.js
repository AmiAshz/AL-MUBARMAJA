const baseTemplate = (contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VANTARA</title>
  <style>
    body {
      background-color: #0C0C0C;
      color: #F5F5F0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #0C0C0C;
      padding: 40px 20px;
    }
    .container {
      background-color: #121212;
      border: 1px solid #222222;
      border-radius: 12px;
      max-width: 580px;
      margin: 0 auto;
      padding: 40px 30px;
      text-align: left;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      display: inline-block;
      background-color: #1A1A1A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #D4AF37;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      padding: 8px 16px;
      text-transform: uppercase;
      text-decoration: none;
      border-radius: 4px;
    }
    .tagline {
      color: #8A8A93;
      font-size: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 10px;
      text-align: center;
    }
    .content {
      color: #F5F5F0;
      font-size: 15px;
      line-height: 1.6;
    }
    h1 {
      color: #F5F5F0;
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 20px;
    }
    p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      background-color: #D4AF37;
      border: none;
      color: #0C0C0C !important;
      display: inline-block;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 1px;
      padding: 12px 24px;
      text-decoration: none;
      text-transform: uppercase;
      border-radius: 6px;
      transition: background-color 0.2s ease;
    }
    .btn:hover {
      background-color: #e5be3c;
    }
    .footer {
      color: #8A8A93;
      font-size: 12px;
      margin-top: 40px;
      border-top: 1px solid #222222;
      padding-top: 20px;
      text-align: center;
      line-height: 1.5;
    }
    .footer-brand {
      color: #D4AF37;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .expiry {
      color: #8A8A93;
      font-size: 13px;
      font-style: italic;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <span class="logo">Vantara</span>
        <div class="tagline">The Journey Behind Every Repair.</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <div class="footer-brand">Vantara</div>
        <div>The Journey Behind Every Repair.</div>
        <div style="margin-top: 10px; font-size: 10px;">&copy; 2026 VANTARA. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const verificationEmail = (name, url, expiresMinutes) => baseTemplate(`
  <h1>Verify your VANTARA account</h1>
  <p>Hello ${name},</p>
  <p>Welcome to VANTARA.</p>
  <p>Please verify your email address to activate your workshop account.</p>
  <div class="cta-container">
    <a href="${url}" class="btn" target="_blank">Verify Email</a>
  </div>
  <p class="expiry">This verification link expires after ${expiresMinutes} minutes.</p>
  <p style="font-size: 13px; color: #8A8A93; margin-top: 20px;">If you did not create this account, you can safely ignore this email.</p>
`);

const passwordResetEmail = (name, url, expiresMinutes) => baseTemplate(`
  <h1>Reset your VANTARA password</h1>
  <p>Hello ${name},</p>
  <p>We received a request to reset the password for your VANTARA workshop account.</p>
  <p>Please click the button below to set a new password:</p>
  <div class="cta-container">
    <a href="${url}" class="btn" target="_blank">Reset Password</a>
  </div>
  <p class="expiry">This password reset link expires after ${expiresMinutes} minutes.</p>
  <p style="font-size: 13px; color: #8A8A93; margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
`);

const welcomeEmail = (name, dashboardUrl) => baseTemplate(`
  <h1>Welcome to VANTARA</h1>
  <p>Hello ${name},</p>
  <p>Your email address has been successfully verified.</p>
  <p>Welcome to VANTARA. Your workshop staff account is now fully active.</p>
  <div class="cta-container">
    <a href="${dashboardUrl}" class="btn" target="_blank">Go to Dashboard</a>
  </div>
`);

const accountInvitationEmail = (role, url) => baseTemplate(`
  <h1>VANTARA Staff Invitation</h1>
  <p>Hello,</p>
  <p>You have been invited to join the VANTARA workshop management team as a <strong>${role}</strong>.</p>
  <p>Please click the button below to accept the invitation and activate your account:</p>
  <div class="cta-container">
    <a href="${url}" class="btn" target="_blank">Accept Invitation</a>
  </div>
  <p style="font-size: 13px; color: #8A8A93; margin-top: 20px;">If you were not expecting this invitation, you can safely ignore this email.</p>
`);

const workshopNotificationEmail = (title, message) => baseTemplate(`
  <h1>${title}</h1>
  <p>${message}</p>
`);

module.exports = {
  verificationEmail,
  passwordResetEmail,
  welcomeEmail,
  accountInvitationEmail,
  workshopNotificationEmail
};

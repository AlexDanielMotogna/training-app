import * as brevo from '@getbrevo/brevo';

// Configure Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@rhinostraining.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'TeamTrainer';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: options.to }];
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.htmlContent;
  sendSmtpEmail.textContent = options.textContent || options.htmlContent.replace(/<[^>]*>/g, '');

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #203731; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background-color: #f5f5f5; }
        .button { display: inline-block; padding: 12px 30px; background-color: #FFB612; color: #203731; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TeamTrainer</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetLink}">${resetLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TeamTrainer. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - TeamTrainer',
    htmlContent,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #203731; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background-color: #f5f5f5; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to TeamTrainer!</h1>
        </div>
        <div class="content">
          <h2>Hey ${name}!</h2>
          <p>Welcome to the TeamTrainer family! Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>Track your workouts and progress</li>
            <li>Log training sessions</li>
            <li>View your performance stats</li>
            <li>Connect with your teammates</li>
            <li>Access training videos</li>
          </ul>
          <p>Get ready to dominate the field!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TeamTrainer. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to TeamTrainer!',
    htmlContent,
  });
}

export interface InvitationEmailOptions {
  email: string;
  organizationName: string;
  inviterName: string;
  role: string;
  invitationToken: string;
}

export async function sendInvitationEmail(options: InvitationEmailOptions): Promise<void> {
  const { email, organizationName, inviterName, role, invitationToken } = options;
  const inviteLink = `${FRONTEND_URL}/join?token=${invitationToken}`;

  // Format role display
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Invitation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background-color: #f9fafb;
          padding: 20px;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo-circle {
          width: 80px;
          height: 80px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          backdrop-filter: blur(10px);
        }
        .logo-text {
          color: white;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .header-title {
          color: white;
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        .invitation-card {
          background: linear-gradient(to right, #f3f4f6, #e5e7eb);
          border-radius: 10px;
          padding: 25px;
          margin: 30px 0;
          border-left: 4px solid #667eea;
        }
        .card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        .card-row:first-child {
          padding-top: 0;
        }
        .card-row:last-child {
          padding-bottom: 0;
        }
        .card-label {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .card-value {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        .cta-container {
          text-align: center;
          margin: 35px 0;
        }
        .cta-button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
          transform: translateY(-2px);
        }
        .features {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
        }
        .features-title {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 15px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-item {
          padding: 8px 0;
          font-size: 14px;
          color: #6b7280;
          display: flex;
          align-items: start;
        }
        .feature-item:before {
          content: "✓";
          color: #10b981;
          font-weight: bold;
          margin-right: 12px;
          font-size: 16px;
          flex-shrink: 0;
        }
        .expiry-notice {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 25px 0;
          font-size: 14px;
          color: #92400e;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);
          margin: 30px 0;
        }
        .link-section {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-top: 25px;
        }
        .link-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .link-text {
          font-size: 13px;
          color: #667eea;
          word-break: break-all;
          text-decoration: none;
        }
        .footer {
          padding: 30px;
          text-align: center;
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          font-size: 13px;
          color: #9ca3af;
          margin: 5px 0;
        }
        .footer-link {
          color: #667eea;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .content, .header { padding: 25px 20px; }
          .invitation-card { padding: 20px; }
          .card-row { flex-direction: column; align-items: flex-start; gap: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo-circle">
            <span class="logo-text">${organizationName.charAt(0).toUpperCase()}</span>
          </div>
          <h1 class="header-title">Team Invitation</h1>
        </div>

        <div class="content">
          <p class="greeting">You're Invited! 🎉</p>

          <p class="message">
            <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong>'s team on our training platform.
          </p>

          <div class="invitation-card">
            <div class="card-row">
              <span class="card-label">Organization</span>
              <span class="card-value">${organizationName}</span>
            </div>
            <div class="divider" style="margin: 15px 0;"></div>
            <div class="card-row">
              <span class="card-label">Your Role</span>
              <span class="card-value">${roleDisplay}</span>
            </div>
          </div>

          <div class="features">
            <p class="features-title">What you can do:</p>
            <ul class="feature-list">
              <li class="feature-item">Track training sessions and workouts</li>
              <li class="feature-item">View performance metrics and progress</li>
              <li class="feature-item">Access training plans and exercises</li>
              <li class="feature-item">Collaborate with coaches and teammates</li>
              <li class="feature-item">Monitor leaderboards and achievements</li>
            </ul>
          </div>

          <div class="cta-container">
            <a href="${inviteLink}" class="cta-button">Accept Invitation</a>
          </div>

          <div class="expiry-notice">
            <strong>⏱️ Time-sensitive:</strong> This invitation will expire in 7 days.
          </div>

          <p class="message" style="font-size: 14px; margin-top: 25px;">
            If you already have an account, you'll be added to the organization. If not, you'll be able to create an account and join.
          </p>

          <div class="link-section">
            <p class="link-label">Or copy and paste this link into your browser:</p>
            <a href="${inviteLink}" class="link-text">${inviteLink}</a>
          </div>
        </div>

        <div class="footer">
          <p class="footer-text">
            &copy; ${new Date().getFullYear()} TeamTraining Platform. All rights reserved.
          </p>
          <p class="footer-text">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `${inviterName} invited you to join ${organizationName}`,
    htmlContent,
  });
}

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
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #0a0a0a;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 40px 20px;
          text-align: center;
          border-radius: 0 0 20px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 30px;
          background-color: #0a0a0a;
        }
        .content h2 {
          color: #ffffff;
          font-size: 24px;
          margin-bottom: 16px;
        }
        .content p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
        }
        .button {
          display: inline-block;
          padding: 14px 40px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        }
        .button:hover {
          background: linear-gradient(135deg, #5558e8 0%, #7c4fe0 100%);
        }
        .footer {
          padding: 30px 20px;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .link-text {
          color: #818cf8;
          word-break: break-all;
        }
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
          <p><strong style="color: #ffffff;">This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="font-size: 12px; color: rgba(255,255,255,0.5);">
            Or copy and paste this link into your browser:<br>
            <a href="${resetLink}" class="link-text">${resetLink}</a>
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
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #0a0a0a;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 40px 20px;
          text-align: center;
          border-radius: 0 0 20px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 30px;
          background-color: #0a0a0a;
        }
        .content h2 {
          color: #ffffff;
          font-size: 24px;
          margin-bottom: 16px;
        }
        .content p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
        }
        .content ul {
          color: rgba(255,255,255,0.7);
          padding-left: 20px;
        }
        .content li {
          margin-bottom: 8px;
        }
        .footer {
          padding: 30px 20px;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .highlight {
          background: rgba(99,102,241,0.1);
          border-left: 4px solid #6366f1;
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
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
          <div class="highlight">
            <p style="margin: 0; color: #ffffff;"><strong>You can now:</strong></p>
          </div>
          <ul>
            <li>Track your workouts and progress</li>
            <li>Log training sessions</li>
            <li>View your performance stats</li>
            <li>Connect with your teammates</li>
            <li>Access training videos</li>
          </ul>
          <p style="font-size: 18px; color: #a78bfa;"><strong>Get ready to dominate the field!</strong></p>
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
    <html>
    <head>
      <style>
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #0a0a0a;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 40px 20px;
          text-align: center;
          border-radius: 0 0 20px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 30px;
          background-color: #0a0a0a;
        }
        .content h2 {
          color: #ffffff;
          font-size: 24px;
          margin-bottom: 16px;
        }
        .content p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
        }
        .content ul {
          color: rgba(255,255,255,0.7);
          padding-left: 20px;
        }
        .content li {
          margin-bottom: 8px;
        }
        .button {
          display: inline-block;
          padding: 14px 40px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        }
        .footer {
          padding: 30px 20px;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .highlight {
          background: rgba(99,102,241,0.1);
          border-left: 4px solid #6366f1;
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .highlight p {
          margin: 4px 0;
          color: rgba(255,255,255,0.9);
        }
        .link-text {
          color: #818cf8;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TeamTrainer Invitation</h1>
        </div>
        <div class="content">
          <h2>You're Invited!</h2>
          <p><strong style="color: #ffffff;">${inviterName}</strong> has invited you to join <strong style="color: #ffffff;">${organizationName}</strong> on TeamTrainer.</p>

          <div class="highlight">
            <p><strong>Organization:</strong> ${organizationName}</p>
            <p><strong>Your Role:</strong> ${roleDisplay}</p>
          </div>

          <p>TeamTrainer is a multi-sport training management platform where you can:</p>
          <ul>
            <li>Track training sessions and workouts</li>
            <li>View performance metrics and progress</li>
            <li>Access training plans and exercises</li>
            <li>Collaborate with coaches and teammates</li>
            <li>Monitor leaderboards and achievements</li>
          </ul>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" class="button">Accept Invitation</a>
          </p>

          <p><strong style="color: #ffffff;">This invitation will expire in 7 days.</strong></p>
          <p>If you already have an account, you'll be added to the organization. If not, you'll be able to create an account and join.</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="font-size: 12px; color: rgba(255,255,255,0.5);">
            Or copy and paste this link into your browser:<br>
            <a href="${inviteLink}" class="link-text">${inviteLink}</a>
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
    subject: `Invitation to join ${organizationName} on TeamTrainer`,
    htmlContent,
  });
}

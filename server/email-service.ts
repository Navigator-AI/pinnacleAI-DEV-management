import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // If email credentials are not configured, log a warning
    if (!emailHost || !emailUser || !emailPass) {
      console.warn('Email service not configured. Password reset emails will be logged to console.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort || '587'),
        secure: emailPort === '465',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendPasswordResetEmail(email: string, resetCode: string, userName: string) {
    const subject = 'Password Reset Code - Task Management';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your Task Management account.</p>
            <p>Use the following verification code to reset your password:</p>
            
            <div class="code-box">
              <div class="code">${resetCode}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This code will expire in 15 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this code with anyone</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact your system administrator.</p>
            
            <p>Best regards,<br>Task Management Team</p>
          </div>
          <div class="footer">
            <p>© 2026 Task Management AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${userName},

We received a request to reset your password for your Task Management account.

Your verification code is: ${resetCode}

This code will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
Task Management Team
    `;

    // If transporter is not configured, log to console (for development)
    if (!this.transporter) {
      console.log('\n=================================');
      console.log('PASSWORD RESET EMAIL (Development Mode)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Reset Code: ${resetCode}`);
      console.log('=================================\n');
      return { success: true, message: 'Email logged to console (development mode)' };
    }

    try {
      await this.transporter.sendMail({
        from: `"Task Management" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text,
        html,
      });

      console.log(`Password reset email sent to ${email}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Fallback to console logging if email fails
      console.log('\n=================================');
      console.log('PASSWORD RESET EMAIL (Fallback)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Reset Code: ${resetCode}`);
      console.log('=================================\n');
      
      return { success: true, message: 'Email service unavailable, code logged to console' };
    }
  }
}

export const emailService = new EmailService();

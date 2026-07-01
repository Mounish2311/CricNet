/**
 * Email templates and sending utilities for CricNet
 * Uses Supabase's built-in email service
 */

export interface LoginConfirmationEmailData {
  email: string;
  fullName: string;
  deviceName: string;
  timestamp: string;
  ipAddress?: string;
}

/**
 * Generate HTML email template for login confirmation
 */
export function getLoginConfirmationEmailHTML(data: LoginConfirmationEmailData): string {
  const date = new Date(data.timestamp).toLocaleString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; background: linear-gradient(to right, #FF9933, white, #138808); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
    .device-info { background: white; padding: 15px; border-left: 4px solid #FF9933; margin: 15px 0; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
    .button { display: inline-block; background: #FF9933; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CricNet</div>
    </div>

    <div class="content">
      <p>Hi ${data.fullName},</p>

      <p>We detected a login to your CricNet account from a new device. If this was you, you can ignore this email.</p>

      <div class="device-info">
        <strong>Login Details:</strong><br>
        Device: ${data.deviceName}<br>
        Time: ${date}<br>
        ${data.ipAddress ? `IP Address: ${data.ipAddress}<br>` : ''}
      </div>

      <p><strong>Didn't recognize this login?</strong></p>
      <p>If you didn't authorize this login, please reset your password immediately to secure your account.</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password" class="button">Reset Password</a>

      <p style="font-size: 12px; color: #666; margin-top: 20px;">
        This is an automated security notification. Please don't reply to this email.
      </p>
    </div>

    <div class="footer">
      <p>&copy; 2024 CricNet. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email template
 */
export function getLoginConfirmationEmailText(data: LoginConfirmationEmailData): string {
  const date = new Date(data.timestamp).toLocaleString();

  return `
Hi ${data.fullName},

We detected a login to your CricNet account from a new device. If this was you, you can ignore this email.

Login Details:
- Device: ${data.deviceName}
- Time: ${date}
${data.ipAddress ? `- IP Address: ${data.ipAddress}` : ''}

Didn't recognize this login?
If you didn't authorize this login, please reset your password immediately to secure your account.

Visit: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password

---
This is an automated security notification. Please don't reply to this email.
© 2024 CricNet. All rights reserved.
  `.trim();
}

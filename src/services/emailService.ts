import sgMail from '@sendgrid/mail';
import { AccessLevel } from '../store/accessStore';
import { useAuthStore } from '../store/authStore';

// Initialize SendGrid with your API key
sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

interface EmailTemplate {
  subject: string;
  html: string;
}

const templates = {
  accessInvite: (inviterName: string, accessLevel: AccessLevel): EmailTemplate => ({
    subject: `You've been invited to access ${inviterName}'s iDecide account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2D5959;">iDecide Access Invitation</h2>
        <p>Hello,</p>
        <p>${inviterName} has invited you to access their iDecide account as a <strong>${accessLevel}</strong>.</p>
        <p>Access level permissions:</p>
        <ul>
          ${accessLevel === 'admin' ? `
            <li>Full access to all documents and settings</li>
            <li>Ability to manage other users' access</li>
            <li>Can modify all account settings</li>
          ` : accessLevel === 'executor' ? `
            <li>View and manage important documents</li>
            <li>Access to financial and legal information</li>
            <li>Limited administrative capabilities</li>
          ` : `
            <li>View-only access to shared documents</li>
            <li>Cannot modify any information</li>
            <li>Basic account access</li>
          `}
        </ul>
        <p>Click the link below to accept this invitation:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_APP_URL}/auth/accept-invite?token=[INVITE_TOKEN]" style="
            background-color: #2D5959;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
          ">Accept Invitation</a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you did not expect this invitation, please ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          iDecide - Your comprehensive estate planning and life organization platform
        </p>
      </div>
    `
  })
};

class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendInviteEmail(
    recipientEmail: string,
    accessLevel: AccessLevel
  ): Promise<void> {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('No authenticated user');

    const template = templates.accessInvite(user.email, accessLevel);

    try {
      await sgMail.send({
        to: recipientEmail,
        from: {
          email: 'noreply@yourdomain.com', // Replace with your verified sender
          name: 'iDecide'
        },
        subject: template.subject,
        html: template.html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send invitation email');
    }
  }
}

export const emailService = EmailService.getInstance();
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '../lib/supabase';
import { TravelEmail } from '../types';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

export class GmailService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GMAIL_CLIENT_ID,
      process.env.VITE_GMAIL_CLIENT_SECRET,
      `${window.location.origin}/travel/email/callback`
    );
  }

  async authorize(userId: string): Promise<string> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });

    // Store state for validation
    await supabase
      .from('email_integrations')
      .upsert({
        user_id: userId,
        provider: 'gmail',
        is_connected: false,
      });

    return authUrl;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Update the integration status
    await supabase
      .from('email_integrations')
      .update({
        is_connected: true,
        last_synced: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  async syncEmails(userId: string): Promise<void> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // Get emails from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${thirtyDaysAgo.getTime()} subject:(booking OR confirmation OR itinerary OR ticket OR travel OR flight)`,
    });

    const messages = response.data.messages || [];
    const emailPromises = messages.map(async (message) => {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });

      const headers = email.data.payload?.headers || [];
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Process attachments
      const attachments = [];
      if (email.data.payload?.parts) {
        for (const part of email.data.payload.parts) {
          if (part.filename && part.body?.attachmentId) {
            const attachment = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: message.id!,
              id: part.body.attachmentId,
            });

            // Upload attachment to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('travel-attachments')
              .upload(
                `${userId}/${message.id}/${part.filename}`,
                Buffer.from(attachment.data.data!, 'base64'),
                {
                  contentType: part.mimeType,
                }
              );

            if (!uploadError) {
              attachments.push({
                name: part.filename,
                url: uploadData.path,
                type: part.mimeType,
              });
            }
          }
        }
      }

      // Store the email in the database
      const travelEmail: Partial<TravelEmail> = {
        user_id: userId,
        email_id: message.id!,
        subject,
        from,
        received_date: new Date(date).toISOString(),
        type: this.determineEmailType(subject),
        processed: false,
        attachments,
      };

      await supabase
        .from('travel_emails')
        .upsert(travelEmail);
    });

    await Promise.all(emailPromises);

    // Update last synced timestamp
    await supabase
      .from('email_integrations')
      .update({
        last_synced: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  private determineEmailType(subject: string): 'booking' | 'confirmation' | 'itinerary' | 'ticket' | 'other' {
    subject = subject.toLowerCase();
    if (subject.includes('booking')) return 'booking';
    if (subject.includes('confirmation')) return 'confirmation';
    if (subject.includes('itinerary')) return 'itinerary';
    if (subject.includes('ticket')) return 'ticket';
    return 'other';
  }
}

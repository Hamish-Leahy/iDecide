import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { supabase } from '../../../lib/supabase';

export const GmailCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Verify the auth was initiated by us
        if (!localStorage.getItem('gmailAuthPending')) {
          throw new Error('Invalid authentication state');
        }

        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens
        const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_GMAIL_CLIENT_SECRET;
        const redirectUri = `${window.location.origin}/travel/email/callback`;

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange authorization code for tokens');
        }

        const tokens = await tokenResponse.json();

        // Get user email
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user information');
        }

        const userInfo = await userInfoResponse.json();

        // Store integration in database
        const { error: dbError } = await supabase
          .from('email_integrations')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            provider: 'gmail',
            email: userInfo.email,
            is_connected: true,
            last_synced: new Date().toISOString(),
            tokens: {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expiry_date: Date.now() + (tokens.expires_in * 1000),
            },
          });

        if (dbError) throw dbError;

        // Clean up
        localStorage.removeItem('gmailAuthPending');

        // Navigate back to email settings
        navigate('/travel/email', { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete Gmail integration');
        localStorage.removeItem('gmailAuthPending');
      }
    };

    handleCallback();
  }, [location.search, navigate]);

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
      <CircularProgress sx={{ mb: 2 }} />
      <Typography>Completing Gmail integration...</Typography>
    </Box>
  );
};

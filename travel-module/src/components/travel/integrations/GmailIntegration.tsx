import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Email as EmailIcon, Add as AddIcon } from '@mui/icons-material';
import { supabase } from '../../../lib/supabase';
import { EmailIntegration } from '../../../types';

interface GmailIntegrationProps {
  onSuccess: () => void;
}

export const GmailIntegration: React.FC<GmailIntegrationProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [integration, setIntegration] = useState<EmailIntegration | null>(null);

  const handleGmailAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Gmail OAuth
      const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
      const redirectUri = `${window.location.origin}/travel/email/callback`;
      const scope = 'https://www.googleapis.com/auth/gmail.readonly';

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=${scope}&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Store state in localStorage to verify callback
      localStorage.setItem('gmailAuthPending', 'true');

      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Gmail integration');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoveIntegration = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: dbError } = await supabase
        .from('email_integrations')
        .delete()
        .eq('id', integration?.id);

      if (dbError) throw dbError;

      setIntegration(null);
      onSuccess();
      setShowDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove integration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <EmailIcon color="action" />
              <div>
                <Typography variant="h6">Gmail Integration</Typography>
                <Typography variant="body2" color="text.secondary">
                  Automatically import travel-related emails from Gmail
                </Typography>
              </div>
            </Box>
            {integration ? (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowDialog(true)}
                disabled={loading}
              >
                Remove Integration
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleGmailAuth}
                disabled={loading}
              >
                Connect Gmail
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {integration && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Connected Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {integration.email}
              </Typography>
              {integration.lastSynced && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Last synced: {new Date(integration.lastSynced).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Remove Gmail Integration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove the Gmail integration? This will stop automatic email syncing
            for travel-related emails.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRemoveIntegration}
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

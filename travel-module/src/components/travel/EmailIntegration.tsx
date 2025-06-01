import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { TravelEmail } from '../../types';

interface EmailIntegrationProps {
  emails: TravelEmail[];
  onSync: () => Promise<void>;
  lastSynced?: string;
}

const EmailIntegration: React.FC<EmailIntegrationProps> = ({ emails, onSync, lastSynced }) => {
  const [syncing, setSyncing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      await onSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync emails');
    } finally {
      setSyncing(false);
    }
  };

  const getRecentEmails = () => {
    return emails.slice(0, 5);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Email Integration</Typography>
        <Box>
          {lastSynced && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
              Last synced: {new Date(lastSynced).toLocaleString()}
            </Typography>
          )}
          <Button
            startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
            variant="contained"
            color="primary"
            onClick={handleSync}
            disabled={syncing}
          >
            Sync Emails
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {getRecentEmails().map((email) => (
          <Grid item xs={12} key={email.id}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon color="action" />
                  <Box flexGrow={1}>
                    <Typography variant="subtitle2">
                      {email.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      From: {email.from}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(email.receivedDate).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        color: email.processed ? 'success.main' : 'warning.main',
                      }}
                    >
                      {email.processed ? 'Processed' : 'Pending'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

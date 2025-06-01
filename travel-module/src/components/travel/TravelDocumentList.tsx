import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { TravelDocument } from '../../types';

interface TravelDocumentListProps {
  documents: TravelDocument[];
  onUpdateDocument: () => void;
}

const TravelDocumentList: React.FC<TravelDocumentListProps> = ({ documents, onUpdateDocument }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'expired': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Travel Documents</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/travel/documents/new'}
        >
          Add Document
        </Button>
      </Box>

      <List>
        {documents.map((document) => (
          <ListItem
            key={document.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemIcon>
              <DocumentIcon />
            </ListItemIcon>
            <ListItemText
              primary={document.type}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {document.documentNumber}
                  </Typography>
                  {document.expiryDate && (
                    <Typography component="span" variant="body2">
                      {' — Expires: '}{formatDate(document.expiryDate)}
                    </Typography>
                  )}
                </>
              }
            />
            <ListItemSecondaryAction>
              <Chip
                label={document.status}
                color={getStatusColor(document.status) as any}
                size="small"
                sx={{ mr: 1 }}
              />
              <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

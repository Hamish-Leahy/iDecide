import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { TravelItinerary, TravelDocument, TravelTicket, TravelEmail } from '../types';
import TravelDocumentList from './travel/TravelDocumentList';
import UpcomingTrips from './travel/UpcomingTrips';
import EmailIntegration from './travel/EmailIntegration';
import TravelStats from './travel/TravelStats';
import { useAuth } from '../contexts/AuthContext';
import { useTravelData } from '../hooks/useTravelData';

export const TravelDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    loading, 
    itineraries, 
    documents, 
    tickets, 
    emails,
    syncEmails,
    refreshData 
  } = useTravelData();

  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Travel Dashboard
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/travel/new'}
            >
              Plan New Trip
            </Button>
          </Box>
        </Grid>

        {/* Stats Overview */}
        <Grid item xs={12}>
          <TravelStats 
            totalTrips={itineraries.length}
            upcomingTrips={itineraries.filter(i => new Date(i.startDate) > new Date()).length}
            documentsToRenew={documents.filter(d => d.status === 'expired').length}
          />
        </Grid>

        {/* Upcoming Trips */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <UpcomingTrips 
              itineraries={itineraries}
              onSelectTrip={setSelectedTrip}
            />
          </Paper>
        </Grid>

        {/* Travel Documents */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TravelDocumentList 
              documents={documents}
              onUpdateDocument={refreshData}
            />
          </Paper>
        </Grid>

        {/* Email Integration */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <EmailIntegration
              emails={emails}
              onSync={syncEmails}
              lastSynced={emails[0]?.receivedDate}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

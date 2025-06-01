import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import {
  FlightTakeoff as FlightIcon,
  EventNote as EventIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface TravelStatsProps {
  totalTrips: number;
  upcomingTrips: number;
  documentsToRenew: number;
}

const TravelStats: React.FC<TravelStatsProps> = ({
  totalTrips,
  upcomingTrips,
  documentsToRenew,
}) => {
  const stats = [
    {
      icon: <FlightIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      label: 'Total Trips',
      value: totalTrips,
    },
    {
      icon: <EventIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      label: 'Upcoming Trips',
      value: upcomingTrips,
    },
    {
      icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      label: 'Documents to Renew',
      value: documentsToRenew,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {stat.icon}
            <Box>
              <Typography variant="h4" component="div">
                {stat.value}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                {stat.label}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TravelStats;

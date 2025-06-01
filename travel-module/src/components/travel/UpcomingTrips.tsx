import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Flight as FlightIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { TravelItinerary } from '../../types';

interface UpcomingTripsProps {
  itineraries: TravelItinerary[];
  onSelectTrip: (tripId: string) => void;
}

const UpcomingTrips: React.FC<UpcomingTripsProps> = ({ itineraries, onSelectTrip }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUpcomingTrips = () => {
    const now = new Date();
    return itineraries
      .filter(trip => new Date(trip.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const upcomingTrips = getUpcomingTrips();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upcoming Trips
      </Typography>
      <List>
        {upcomingTrips.map((trip) => (
          <Card key={trip.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h3">
                  {trip.destination}
                </Typography>
                <IconButton onClick={() => onSelectTrip(trip.id)}>
                  <EditIcon />
                </IconButton>
              </Box>

              <Box display="flex" gap={2} mb={2}>
                <Chip
                  icon={<TimeIcon />}
                  label={`${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`}
                  variant="outlined"
                />
                <Chip
                  icon={<LocationIcon />}
                  label={trip.location}
                  variant="outlined"
                />
              </Box>

              {trip.activities && trip.activities.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Upcoming Activities
                  </Typography>
                  <List dense>
                    {trip.activities.slice(0, 3).map((activity) => (
                      <ListItem key={activity.id}>
                        <ListItemIcon>
                          <EventIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={`${activity.date} ${activity.startTime || ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {trip.tickets && trip.tickets.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Travel Tickets
                  </Typography>
                  <List dense>
                    {trip.tickets.map((ticket) => (
                      <ListItem key={ticket.id}>
                        <ListItemIcon>
                          <FlightIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${ticket.type} - ${ticket.provider}`}
                          secondary={ticket.departureDateTime ? 
                            new Date(ticket.departureDateTime).toLocaleString() : 
                            'Time not specified'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  );
};

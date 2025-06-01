import { SidebarConfig } from '../types/sidebar';
import {
  Flight as FlightIcon,
  Description as DocumentIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  EventNote as ItineraryIcon,
  Receipt as TicketIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export const travelSidebarConfig: SidebarConfig = {
  id: 'travel',
  title: 'Travel Management',
  icon: FlightIcon,
  items: [
    {
      id: 'travel-dashboard',
      title: 'Dashboard',
      icon: DashboardIcon,
      path: '/travel',
    },
    {
      id: 'travel-itineraries',
      title: 'Itineraries',
      icon: ItineraryIcon,
      path: '/travel/itineraries',
    },
    {
      id: 'travel-documents',
      title: 'Documents',
      icon: DocumentIcon,
      path: '/travel/documents',
    },
    {
      id: 'travel-tickets',
      title: 'Tickets',
      icon: TicketIcon,
      path: '/travel/tickets',
    },
    {
      id: 'travel-email',
      title: 'Email Integration',
      icon: EmailIcon,
      path: '/travel/email',
    },
    {
      id: 'travel-settings',
      title: 'Settings',
      icon: SettingsIcon,
      path: '/travel/settings',
    },
  ],
};

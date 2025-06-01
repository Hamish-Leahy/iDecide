import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingScreen } from '../LoadingScreen';

const TravelDashboard = lazy(() => import('../../travel-module/src/components/TravelDashboard'));
const TravelDocuments = lazy(() => import('../../travel-module/src/components/travel/TravelDocuments'));
const TravelTickets = lazy(() => import('../../travel-module/src/components/travel/TravelTickets'));
const EmailIntegration = lazy(() => import('../../travel-module/src/components/travel/EmailIntegration'));
const GmailCallback = lazy(() => import('../../travel-module/src/components/travel/integrations/GmailCallback'));
const TravelSettings = lazy(() => import('../../travel-module/src/components/travel/TravelSettings'));

export const travelRoutes = [
  {
    path: '/travel',
    element: <TravelDashboard />,
  },
  {
    path: '/travel/documents',
    element: <TravelDocuments />,
  },
  {
    path: '/travel/tickets',
    element: <TravelTickets />,
  },
  {
    path: '/travel/email',
    element: <EmailIntegration />,
  },
  {
    path: '/travel/email/callback',
    element: <GmailCallback />,
  },
  {
    path: '/travel/settings',
    element: <TravelSettings />,
  },
];

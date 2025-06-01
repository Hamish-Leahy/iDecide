export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  rating?: number;
  category: string[];
  price: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface Booking {
  id: string;
  userId: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface Review {
  id: string;
  userId: string;
  destinationId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TravelPreferences {
  id: string;
  userId: string;
  preferredCategories: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  preferredDestinations: string[];
}

export interface TravelItinerary {
  id: string;
  bookingId: string;
  userId: string;
  activities: TravelActivity[];
  notes: string;
  budget: {
    planned: number;
    spent: number;
    currency: string;
  };
  documents?: TravelDocument[];
  tickets?: TravelTicket[];
  sharedWith?: string[];
  lastUpdated: string;
  version: number;
  notifications?: {
    type: 'reminder' | 'alert' | 'update';
    message: string;
    date: string;
    status: 'pending' | 'sent' | 'read';
  }[];
}

export interface TravelActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  cost?: number;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'entertainment' | 'other';
  status: 'planned' | 'completed' | 'cancelled';
  weather?: {
    temperature: number;
    condition: string;
    icon: string;
  };
}

export interface TravelExpense {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  category: 'food' | 'transport' | 'accommodation' | 'activities' | 'shopping' | 'other';
  date: string;
  description: string;
  receipt?: string;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: {
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    condition: string;
    icon: string;
  }[];
}

export interface TravelDocument {
  id: string;
  userId: string;
  type: 'passport' | 'visa' | 'insurance' | 'vaccination' | 'other';
  documentNumber?: string;
  issuingCountry?: string;
  issueDate?: string;
  expiryDate?: string;
  imageUrl?: string;
  status: 'valid' | 'expired' | 'pending';
}

export interface TravelTicket {
  id: string;
  bookingId: string;
  userId: string;
  type: 'flight' | 'train' | 'bus' | 'accommodation' | 'event';
  provider: string;
  ticketNumber: string;
  confirmationCode?: string;
  qrCode?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  departureDateTime?: string;
  arrivalDateTime?: string;
  seatInfo?: string;
  status: 'confirmed' | 'cancelled' | 'used' | 'pending';
  attachmentUrl?: string;
}

export interface EmailIntegration {
  id: string;
  userId: string;
  provider: 'gmail' | 'outlook' | 'other';
  email: string;
  isConnected: boolean;
  lastSynced?: string;
  filters?: {
    labels?: string[];
    fromAddresses?: string[];
    keywords?: string[];
  };
}

export interface TravelEmail {
  id: string;
  userId: string;
  emailId: string;
  subject: string;
  from: string;
  receivedDate: string;
  type: 'booking' | 'confirmation' | 'itinerary' | 'ticket' | 'other';
  processed: boolean;
  linkedBookingId?: string;
  linkedTicketId?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

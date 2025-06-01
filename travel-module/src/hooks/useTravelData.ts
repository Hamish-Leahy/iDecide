import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TravelItinerary, TravelDocument, TravelTicket, TravelEmail } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useTravelData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [tickets, setTickets] = useState<TravelTicket[]>([]);
  const [emails, setEmails] = useState<TravelEmail[]>([]);

  const fetchTravelData = async () => {
    try {
      setLoading(true);
      
      // Fetch itineraries
      const { data: itinerariesData, error: itinerariesError } = await supabase
        .from('travel_itineraries')
        .select('*, activities(*)')
        .eq('userId', user?.id)
        .order('startDate', { ascending: true });

      if (itinerariesError) throw itinerariesError;
      setItineraries(itinerariesData || []);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('travel_documents')
        .select('*')
        .eq('userId', user?.id)
        .order('expiryDate', { ascending: true });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('travel_tickets')
        .select('*')
        .eq('userId', user?.id)
        .order('departureDateTime', { ascending: true });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

      // Fetch emails
      const { data: emailsData, error: emailsError } = await supabase
        .from('travel_emails')
        .select('*')
        .eq('userId', user?.id)
        .order('receivedDate', { ascending: false });

      if (emailsError) throw emailsError;
      setEmails(emailsData || []);

    } catch (error) {
      console.error('Error fetching travel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncEmails = async () => {
    try {
      // Implementation for Gmail API integration would go here
      // This would involve:
      // 1. Checking for Gmail API authentication
      // 2. Fetching recent emails with travel-related content
      // 3. Processing and storing relevant emails
      // 4. Updating the UI with new data
      await fetchTravelData();
    } catch (error) {
      console.error('Error syncing emails:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTravelData();
    }
  }, [user]);

  return {
    loading,
    itineraries,
    documents,
    tickets,
    emails,
    syncEmails,
    refreshData: fetchTravelData,
  };
};

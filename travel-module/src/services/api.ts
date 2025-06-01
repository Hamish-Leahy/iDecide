const axios = require('axios').default;
import { Destination, Booking, TravelItinerary, TravelExpense, WeatherInfo } from './types';
import { supabase } from './supabaseClient';

const API_BASE_URL = 'https://api.example.com/travel';

export const fetchDestinations = async (): Promise<Destination[]> => {
    const response = await axios.get(`${API_BASE_URL}/destinations`);
    return response.data;
};

export const createBooking = async (bookingData: Booking): Promise<Booking> => {
    const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
    return response.data;
};

export const updateBooking = async (bookingId: string, bookingData: Booking): Promise<Booking> => {
    const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}`, bookingData);
    return response.data;
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`);
};

// Itinerary Management
export const createItinerary = async (itinerary: Omit<TravelItinerary, 'id'>): Promise<TravelItinerary> => {
    const { data, error } = await supabase
      .from('travel_itineraries')
      .insert([itinerary])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create itinerary');
    return data;
};

export const updateItinerary = async (id: string, updates: Partial<TravelItinerary>): Promise<void> => {
    const { error } = await supabase
      .from('travel_itineraries')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
};

export const getItinerary = async (id: string): Promise<TravelItinerary> => {
    const { data, error } = await supabase
      .from('travel_itineraries')
      .select('*, activities(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Itinerary not found');
    return data;
};

// Expense Tracking
export const addExpense = async (expense: Omit<TravelExpense, 'id'>): Promise<TravelExpense> => {
    const { data, error } = await supabase
      .from('travel_expenses')
      .insert([expense])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to add expense');
    return data;
};

export const getBookingExpenses = async (bookingId: string): Promise<TravelExpense[]> => {
    const { data, error } = await supabase
      .from('travel_expenses')
      .select('*')
      .eq('bookingId', bookingId);
    
    if (error) throw error;
    return data || [];
};

export const getTripSummary = async (bookingId: string): Promise<{
    totalSpent: number;
    expensesByCategory: Record<string, number>;
    remainingBudget: number;
  }> => {
    const { data: expenses, error: expensesError } = await supabase
      .from('travel_expenses')
      .select('*')
      .eq('bookingId', bookingId);
    
    const { data: itinerary, error: itineraryError } = await supabase
      .from('travel_itineraries')
      .select('budget')
      .eq('bookingId', bookingId)
      .single();
    
    if (expensesError) throw expensesError;
    if (itineraryError) throw itineraryError;
    
    const total = expenses?.reduce((sum: number, exp: TravelExpense) => sum + exp.amount, 0) || 0;
    const expenseCategorySummary = expenses?.reduce((acc: Record<string, number>, exp: TravelExpense) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {}) || {};

    return {
      totalSpent: total,
      expensesByCategory: expenseCategorySummary,
      remainingBudget: (itinerary?.budget || 0) - total
    };
  };

// Weather Integration
export const getDestinationWeather = async (location: string): Promise<WeatherInfo> => {
    // Note: You would need to implement the actual weather API integration here
    // This is just a placeholder that returns mock data
    const mockWeather: WeatherInfo = {
      temperature: 25,
      condition: 'Sunny',
      icon: 'sun',
      humidity: 65,
      windSpeed: 10,
      precipitation: 0,
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        temperature: {
          min: 20 + Math.random() * 5,
          max: 25 + Math.random() * 5,
        },
        condition: 'Sunny',
        icon: 'sun',
      })),
    };
    
    return mockWeather;
  };

// Trip Recommendations
export const getRecommendedDestinations = async (userId: string): Promise<Destination[]> => {
    // First get user preferences
    const { data: preferences } = await supabase
      .from('travel_preferences')
      .select('*')
      .eq('userId', userId)
      .single();

    if (!preferences) return [];

    // Get destinations matching preferences
    const { data: destinations } = await supabase
      .from('travel_destinations')
      .select('*')
      .contains('category', preferences.preferredCategories)
      .gte('price.min', preferences.priceRange.min)
      .lte('price.max', preferences.priceRange.max);

    return destinations || [];
  }
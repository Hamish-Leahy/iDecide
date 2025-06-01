export interface Destination {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
}

export interface Booking {
    id: string;
    destinationId: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface TravelItinerary {
    id: string;
    bookingId: string;
    activities: TravelActivity[];
    notes: string;
    lastUpdated: Date;
}

export interface TravelActivity {
    id: string;
    itineraryId: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    location: string;
}

export interface TravelExpense {
    id: string;
    bookingId: string;
    amount: number;
    category: string;
    description: string;
    date: Date;
}

export interface WeatherInfo {
    temperature: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    forecast: WeatherForecast[];
}

export interface WeatherForecast {
    date: string;
    temperature: {
        min: number;
        max: number;
    };
    condition: string;
    icon: string;
}
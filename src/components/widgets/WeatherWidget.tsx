import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer } from 'lucide-react';
import { Card } from '../common/Card';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    day: string;
    condition: string;
    high: number;
    low: number;
  }>;
}

interface WeatherWidgetProps {
  className?: string;
}

export function WeatherWidget({ className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>({
    location: 'Sydney, AU',
    temperature: 24,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Mon', condition: 'Sunny', high: 26, low: 18 },
      { day: 'Tue', condition: 'Partly Cloudy', high: 25, low: 17 },
      { day: 'Wed', condition: 'Rainy', high: 22, low: 16 },
      { day: 'Thu', condition: 'Cloudy', high: 23, low: 17 },
      { day: 'Fri', condition: 'Sunny', high: 27, low: 19 }
    ]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('Sydney, AU');
  const [isEditing, setIsEditing] = useState(false);
  
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="text-amber-500" />;
      case 'partly cloudy':
        return <Cloud className="text-gray-500" />;
      case 'cloudy':
        return <Cloud className="text-gray-500" />;
      case 'rainy':
        return <CloudRain className="text-blue-500" />;
      case 'snowy':
        return <CloudSnow className="text-blue-200" />;
      case 'stormy':
        return <CloudLightning className="text-purple-500" />;
      default:
        return <Sun className="text-amber-500" />;
    }
  };
  
  const updateWeather = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would fetch actual weather data here
      setWeather({
        ...weather,
        location,
        temperature: Math.floor(Math.random() * 15) + 15, // Random temp between 15-30
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
      });
      setIsLoading(false);
      setIsEditing(false);
    }, 1000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWeather();
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud size={18} className="text-blue-500" />
            Weather
          </h3>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="p-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-32"
                placeholder="City, Country"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="p-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {isLoading ? '...' : 'Go'}
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Change
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{weather.location}</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-3xl font-bold">{weather.temperature}°</span>
              <span className="text-sm text-gray-500">{weather.condition}</span>
            </div>
          </div>
          <div className="text-4xl">
            {getWeatherIcon(weather.condition)}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Droplets size={14} className="text-blue-500" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind size={14} className="text-blue-500" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer size={14} className="text-red-500" />
            <span>Feels like {weather.temperature + 1}°</span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">5-Day Forecast</h4>
          <div className="flex justify-between">
            {weather.forecast.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-gray-700">{day.day}</div>
                <div className="my-1">{getWeatherIcon(day.condition)}</div>
                <div className="text-xs">
                  <span className="font-medium">{day.high}°</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-500">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
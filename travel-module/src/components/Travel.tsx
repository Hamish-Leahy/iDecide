import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DestinationsGrid } from './destinations';
import { BookingsList } from './bookings';
import {
  Map,
  CalendarCheck,
  Heart,
  Globe,
  Compass,
  Car,
  Hotel,
  Plane
} from 'lucide-react';

export function Travel() {
  const navItems = [
    {
      id: 'destinations',
      label: 'Destinations',
      description: 'Explore amazing travel destinations',
      icon: <Globe size={24} />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      description: 'View and manage your travel plans',
      icon: <CalendarCheck size={24} />,
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 'favorites',
      label: 'Saved Places',
      description: 'Your favorite destinations',
      icon: <Heart size={24} />,
      color: 'bg-rose-50 text-rose-600'
    },
    {
      id: 'map',
      label: 'Travel Map',
      description: 'Visualize your travels',
      icon: <Map size={24} />,
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  const suggestedCategories = [
    {
      icon: <Compass />,
      label: 'Adventure',
      description: 'Thrilling outdoor activities'
    },
    {
      icon: <Hotel />,
      label: 'Luxury',
      description: 'Premium accommodations'
    },
    {
      icon: <Car />,
      label: 'Road Trips',
      description: 'Scenic driving routes'
    },
    {
      icon: <Plane />,
      label: 'International',
      description: 'Worldwide destinations'
    }
  ];

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Travel</h1>
              <p className="text-gray-600 mt-1">Plan and manage your travel experiences</p>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {navItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(item.id)}
              >
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Suggested Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Explore by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestedCategories.map((category, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.label}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="w-full justify-start">
                  <Globe size={20} className="mr-2" />
                  Browse Destinations
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarCheck size={20} className="mr-2" />
                  My Bookings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart size={20} className="mr-2" />
                  Saved Places
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Map size={20} className="mr-2" />
                  View Travel Map
                </Button>
              </div>
            </div>
          </Card>
        </div>
      } />
      <Route path="/destinations" element={<DestinationsGrid />} />
      <Route path="/bookings" element={<BookingsList />} />
      <Route path="*" element={<Navigate to="/travel" replace />} />
    </Routes>
  );
}

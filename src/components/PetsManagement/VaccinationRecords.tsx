import React from 'react';
import { Syringe } from 'lucide-react';
import { Card } from '../common/Card';

export function VaccinationRecords() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vaccination Records</h1>
          <p className="text-gray-600 mt-1">Track your pets' vaccination history</p>
        </div>
      </div>
      
      <Card>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Syringe className="text-amber-600" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The vaccination records feature is currently under development. Soon you'll be able to track all your pets' vaccinations, set reminders for boosters, and share records with veterinarians.
          </p>
        </div>
      </Card>
    </div>
  );
}
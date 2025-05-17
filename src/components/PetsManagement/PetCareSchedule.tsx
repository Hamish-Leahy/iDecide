import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Card } from '../common/Card';

export function PetCareSchedule() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pet Care Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your pets' care routines</p>
        </div>
      </div>
      
      <Card>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The pet care schedule feature is currently under development. Soon you'll be able to create care routines, set reminders for feeding, medication, grooming, and exercise.
          </p>
        </div>
      </Card>
    </div>
  );
}
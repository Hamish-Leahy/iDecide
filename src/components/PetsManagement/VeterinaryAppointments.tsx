import React from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '../common/Card';

export function VeterinaryAppointments() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veterinary Appointments</h1>
          <p className="text-gray-600 mt-1">Schedule and manage vet appointments</p>
        </div>
      </div>
      
      <Card>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The veterinary appointments feature is currently under development. Soon you'll be able to schedule appointments, set reminders, and keep track of your pets' veterinary visits.
          </p>
        </div>
      </Card>
    </div>
  );
}
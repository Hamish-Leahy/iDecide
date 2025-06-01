import React, { useState } from 'react';
import { Calendar, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { travelApi } from '../../services/api';
import { Destination } from '../../types';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';

interface BookingFormProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingForm({ destination, isOpen, onClose, onSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
  });

  const calculateTotalPrice = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return destination.price.min * formData.guests * days;
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate form
    if (!formData.startDate || !formData.endDate || formData.guests < 1) {
      setError('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      setError('End date must be after start date');
      return;
    }

    if (startDate < new Date()) {
      setError('Start date cannot be in the past');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await travelApi.createBooking({
        userId: user.id,
        destinationId: destination.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        guests: formData.guests,
        totalPrice: calculateTotalPrice(),
        status: 'pending',
        paymentStatus: 'pending'
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Your Trip"
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">{destination.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{destination.location}</p>
          <div className="mt-2 text-sm text-gray-600">
            From {new Intl.NumberFormat('en-AU', {
              style: 'currency',
              currency: destination.price.currency
            }).format(destination.price.min)} per night
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date*
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date*
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests*
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="number"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: Math.max(1, parseInt(e.target.value)) })}
              min="1"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Total Price</span>
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: destination.price.currency
              }).format(calculateTotalPrice())}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Price includes accommodation for {formData.guests} guest{formData.guests !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
}

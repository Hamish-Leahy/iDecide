import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Stethoscope, 
  MapPin, 
  CheckCircle, 
  X, 
  CalendarDays, 
  CalendarClock,
  Bell 
} from 'lucide-react';
import { Clock } from '../common/icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { motion } from 'framer-motion';

interface Appointment {
  id: string;
  provider_id?: string;
  date: string;
  type: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reminder_sent: boolean;
  provider?: {
    name: string;
    specialty: string;
    practice_name?: string;
  };
}

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [formData, setFormData] = useState({
    provider_id: '',
    date: '',
    type: 'checkup',
    location: '',
    notes: '',
    status: 'scheduled' as const,
    reminder_sent: false
  });

  const appointmentTypes = [
    { value: 'checkup', label: 'Check-up' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'specialist', label: 'Specialist Visit' },
    { value: 'dental', label: 'Dental' },
    { value: 'vision', label: 'Vision' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'other', label: 'Other' }
  ];

  const statusTypes = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [appointmentsResponse, providersResponse] = await Promise.all([
        supabase
          .from('health_appointments')
          .select(`
            *,
            provider:provider_id (
              name,
              specialty,
              practice_name
            )
          `)
          .eq('user_id', user?.id)
          .order('date', { ascending: true }),
        supabase
          .from('health_providers')
          .select('id, name, specialty, practice_name')
          .eq('user_id', user?.id)
      ]);

      if (appointmentsResponse.error) throw appointmentsResponse.error;
      if (providersResponse.error) throw providersResponse.error;

      setAppointments(appointmentsResponse.data || []);
      setProviders(providersResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('health_appointments')
        .insert([{
          ...formData,
          user_id: user?.id
        }])
        .select(`
          *,
          provider:provider_id (
            name,
            specialty,
            practice_name
          )
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        provider_id: '',
        date: '',
        type: 'checkup',
        location: '',
        notes: '',
        status: 'scheduled',
        reminder_sent: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save appointment');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment');
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.provider?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const upcomingAppointments = filteredAppointments.filter(
    appointment => new Date(appointment.date) > new Date() && appointment.status === 'scheduled'
  );

  const pastAppointments = filteredAppointments.filter(
    appointment => new Date(appointment.date) <= new Date() || appointment.status !== 'scheduled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'checkup':
        return <Stethoscope size={16} />;
      case 'dental':
        return <Tooth size={16} />;
      case 'vision':
        return <Eye size={16} />;
      case 'therapy':
        return <Brain size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  // Group appointments by month and day for calendar view
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.date);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const day = date.getDate();
    
    if (!acc[month]) {
      acc[month] = {};
    }
    
    if (!acc[month][day]) {
      acc[month][day] = [];
    }
    
    acc[month][day].push(appointment);
    return acc;
  }, {} as Record<string, Record<number, Appointment[]>>);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Appointment
        </Button>
      </div>

      {/* Calendar Design */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Calendar className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Appointment Calendar</h2>
              <p className="text-gray-600">Keep track of all your healthcare visits</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-amber-50'}`}
            >
              <CalendarDays size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-amber-50'}`}
            >
              <CalendarClock size={20} />
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4 shadow-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search appointments..."
            className="flex-1"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            {statusTypes.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {viewMode === 'calendar' ? (
          <div className="space-y-8">
            {Object.entries(groupedAppointments).map(([month, days]) => (
              <div key={month} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-amber-500 text-white p-4">
                  <h3 className="text-lg font-semibold">{month}</h3>
                </div>
                <div className="p-4">
                  {Object.entries(days).map(([day, dayAppointments]) => (
                    <div key={day} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-medium">
                          {day}
                        </div>
                        <span className="text-gray-700 font-medium">
                          {new Date(dayAppointments[0].date).toLocaleDateString(undefined, { weekday: 'long' })}
                        </span>
                      </div>
                      <div className="pl-10 space-y-2">
                        {dayAppointments.map(appointment => (
                          <motion.div
                            key={appointment.id}
                            whileHover={{ scale: 1.01 }}
                            className={`p-3 rounded-lg cursor-pointer ${
                              appointment.status === 'scheduled' ? 'bg-blue-50 border-l-4 border-blue-500' :
                              appointment.status === 'completed' ? 'bg-green-50 border-l-4 border-green-500' :
                              appointment.status === 'cancelled' ? 'bg-red-50 border-l-4 border-red-500' :
                              'bg-amber-50 border-l-4 border-amber-500'
                            }`}
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {new Date(appointment.date).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                                    {statusTypes.find(s => s.value === appointment.status)?.label}
                                  </span>
                                </div>
                                <p className="font-medium mt-1">
                                  {appointmentTypes.find(t => t.value === appointment.type)?.label}
                                </p>
                                {appointment.provider && (
                                  <p className="text-sm text-gray-600">
                                    Dr. {appointment.provider.name}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAppointment(appointment.id);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(groupedAppointments).length === 0 && (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-amber-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? 'No appointments match your search criteria'
                    : 'You haven\'t added any appointments yet'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                  >
                    Schedule Your First Appointment
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-500 text-white p-4">
                  <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
                </div>
                <div className="divide-y">
                  {upcomingAppointments.map(appointment => (
                    <motion.div
                      key={appointment.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 cursor-pointer"
                      onClick={() => handleViewAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Calendar className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {new Date(appointment.date).toLocaleDateString()} at{' '}
                              {new Date(appointment.date).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {appointmentTypes.find(t => t.value === appointment.type)?.label}
                            </p>
                            
                            {appointment.provider && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Stethoscope size={14} />
                                <span>{appointment.provider.name}</span>
                                {appointment.provider.practice_name && (
                                  <span className="text-gray-400">
                                    at {appointment.provider.practice_name}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-500 text-white p-4">
                  <h3 className="text-lg font-semibold">Past Appointments</h3>
                </div>
                <div className="divide-y">
                  {pastAppointments.map(appointment => (
                    <motion.div
                      key={appointment.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 cursor-pointer"
                      onClick={() => handleViewAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <Calendar className="text-gray-600" size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {new Date(appointment.date).toLocaleDateString()} at{' '}
                                {new Date(appointment.date).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </h4>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                                {statusTypes.find(s => s.value === appointment.status)?.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {appointmentTypes.find(t => t.value === appointment.type)?.label}
                            </p>
                            
                            {appointment.provider && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Stethoscope size={14} />
                                <span>{appointment.provider.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {filteredAppointments.length === 0 && (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-amber-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? 'No appointments match your search criteria'
                    : 'You haven\'t added any appointments yet'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                  >
                    Schedule Your First Appointment
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Appointment"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select a provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {appointmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Enter appointment location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {statusTypes.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              rows={3}
              placeholder="Add any notes about the appointment"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAppointment}
            >
              Save Appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Appointment Details"
        maxWidth="xl"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${
              selectedAppointment.status === 'scheduled' ? 'bg-blue-50' :
              selectedAppointment.status === 'completed' ? 'bg-green-50' :
              selectedAppointment.status === 'cancelled' ? 'bg-red-50' :
              'bg-amber-50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    selectedAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                    selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                    selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {appointmentTypes.find(t => t.value === selectedAppointment.type)?.label}
                    </h3>
                    <p className={`text-sm ${
                      selectedAppointment.status === 'scheduled' ? 'text-blue-600' :
                      selectedAppointment.status === 'completed' ? 'text-green-600' :
                      selectedAppointment.status === 'cancelled' ? 'text-red-600' :
                      'text-amber-600'
                    }`}>
                      {statusTypes.find(s => s.value === selectedAppointment.status)?.label}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {new Date(selectedAppointment.date).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Clock size={18} className="text-gray-500" />
                      <span>{new Date(selectedAppointment.date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    </div>
                  </div>

                  {selectedAppointment.provider && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Provider</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Stethoscope size={18} className="text-gray-500" />
                        <span>{selectedAppointment.provider.name}</span>
                      </div>
                      {selectedAppointment.provider.specialty && (
                        <p className="text-sm text-gray-500 ml-6 mt-1">
                          {selectedAppointment.provider.specialty}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedAppointment.location && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <MapPin size={18} className="text-gray-500" />
                        <span>{selectedAppointment.location}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-gray-700">
                      {selectedAppointment.notes}
                    </div>
                  </div>
                )}
              </div>

              {selectedAppointment.status === 'scheduled' && (
                <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Bell size={18} />
                    <span className="font-medium">Appointment Reminder</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    You'll receive a reminder 24 hours before your appointment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
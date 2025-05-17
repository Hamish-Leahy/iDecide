import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Clock, 
  MapPin, 
  CheckCircle, 
  X, 
  FileText, 
  MessageSquare 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  provider: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface SupportCoordinator {
  id: string;
  name: string;
  organization: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export function SupportCoordination() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [coordinator, setCoordinator] = useState<SupportCoordinator | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCoordinatorModal, setShowCoordinatorModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    provider: '',
    location: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    notes: ''
  });
  const [coordinatorData, setCoordinatorData] = useState({
    name: '',
    organization: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load NDIS plan to get support coordinator info
        const { data: planData, error: planError } = await supabase
          .from('insurance_policies')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'ndis')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (planError && planError.code !== 'PGRST116') {
          throw planError;
        }
        
        // Set support coordinator if available
        if (planData?.support_coordinator) {
          setCoordinator({
            id: '1',
            name: planData.support_coordinator,
            organization: 'NDIS Support Coordination Agency',
            phone: '0412 345 678',
            email: 'coordinator@example.com',
            notes: 'Your dedicated support coordinator to help manage your NDIS plan'
          });
          setCoordinatorData({
            name: planData.support_coordinator,
            organization: 'NDIS Support Coordination Agency',
            phone: '0412 345 678',
            email: 'coordinator@example.com',
            notes: 'Your dedicated support coordinator to help manage your NDIS plan'
          });
        } else {
          setCoordinator(null);
          setCoordinatorData({
            name: '',
            organization: '',
            phone: '',
            email: '',
            notes: ''
          });
        }
        
        // Load appointments from Supabase
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('ndis_appointments')
          .select('*')
          .eq('user_id', user.id);
        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);
      } catch (err) {
        console.error('Error loading support coordination data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load support coordination data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const handleAddAppointment = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      provider: coordinator?.name || '',
      location: '',
      status: 'scheduled',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleSaveAppointment = () => {
    // Validate form
    if (!formData.title || !formData.date || !formData.time || !formData.provider) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Create new appointment
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      time: formData.time,
      provider: formData.provider,
      location: formData.location,
      status: formData.status,
      notes: formData.notes
    };
    
    // Add to appointments list
    setAppointments([...appointments, newAppointment]);
    
    // Close modal and reset form
    setShowAddModal(false);
    setError(null);
  };

  const handleSaveCoordinator = () => {
    // Validate form
    if (!coordinatorData.name || !coordinatorData.organization) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Update coordinator
    const updatedCoordinator: SupportCoordinator = {
      id: coordinator?.id || '1',
      name: coordinatorData.name,
      organization: coordinatorData.organization,
      phone: coordinatorData.phone,
      email: coordinatorData.email,
      notes: coordinatorData.notes
    };
    
    setCoordinator(updatedCoordinator);
    
    // Close modal
    setShowCoordinatorModal(false);
    setError(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={12} className="mr-1" />
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X size={12} className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const upcomingAppointments = appointments.filter(
    appointment => appointment.status === 'scheduled' && new Date(`${appointment.date}T${appointment.time}`) >= new Date()
  ).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const pastAppointments = appointments.filter(
    appointment => appointment.status === 'completed' || appointment.status === 'cancelled' || new Date(`${appointment.date}T${appointment.time}`) < new Date()
  ).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const filteredAppointments = [...upcomingAppointments, ...pastAppointments].filter(
    appointment => 
      appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Coordination</h1>
          <p className="text-gray-600 mt-1">Manage your support coordination and appointments</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddAppointment}
          icon={<Plus size={20} />}
        >
          Add Appointment
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Support Coordinator Card */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Users className="text-indigo-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Support Coordinator</h2>
                {coordinator ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{coordinator.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Organization</p>
                        <p className="font-medium text-gray-900">{coordinator.organization}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coordinator.phone && (
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">
                            <a href={`tel:${coordinator.phone}`} className="hover:text-indigo-600">
                              {coordinator.phone}
                            </a>
                          </p>
                        </div>
                      )}
                      
                      {coordinator.email && (
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">
                            <a href={`mailto:${coordinator.email}`} className="hover:text-indigo-600">
                              {coordinator.email}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {coordinator.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{coordinator.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 mt-2">No support coordinator assigned yet.</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCoordinatorModal(true)}
              icon={<Edit size={16} />}
            >
              {coordinator ? 'Edit' : 'Add'} Coordinator
            </Button>
          </div>
        </div>
      </Card>

      {/* Appointments */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Appointments</h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search appointments..."
              className="w-64"
            />
          </div>
          
          {filteredAppointments.length > 0 ? (
            <div className="space-y-6">
              {/* Upcoming Appointments */}
              {upcomingAppointments.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Upcoming Appointments</h3>
                  <div className="space-y-3">
                    {upcomingAppointments
                      .filter(appointment => 
                        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appointment.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appointment.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appointment.notes?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(appointment => (
                        <div key={appointment.id} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <Calendar className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                                  {getStatusBadge(appointment.status)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {formatDate(appointment.date)} at {formatTime(appointment.time)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  With {appointment.provider}
                                </p>
                                {appointment.location && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                    <MapPin size={14} />
                                    <span>{appointment.location}</span>
                                  </div>
                                )}
                                {appointment.notes && (
                                  <p className="text-sm text-gray-600 mt-2 italic">
                                    "{appointment.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                title="Edit appointment"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Delete appointment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Past Appointments */}
              {pastAppointments.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Past Appointments</h3>
                  <div className="space-y-3">
                    {pastAppointments
                      .filter(appointment => 
                        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appointment.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appointment.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appointment.notes?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(appointment => (
                        <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <Calendar className="text-gray-500 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                                  {getStatusBadge(appointment.status)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {formatDate(appointment.date)} at {formatTime(appointment.time)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  With {appointment.provider}
                                </p>
                                {appointment.location && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                    <MapPin size={14} />
                                    <span>{appointment.location}</span>
                                  </div>
                                )}
                                {appointment.notes && (
                                  <p className="text-sm text-gray-600 mt-2 italic">
                                    "{appointment.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                title="Edit appointment"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Delete appointment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? 'No appointments match your search'
                  : 'Get started by adding a new appointment'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={handleAddAppointment}
                    icon={<Plus size={20} />}
                  >
                    Add Appointment
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Support Coordination Resources */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Support Coordination Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-indigo-600" size={20} />
                <h3 className="font-medium text-gray-900">NDIS Guidelines</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Official NDIS guidelines for participants and support coordinators.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Guidelines
              </Button>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="text-green-600" size={20} />
                <h3 className="font-medium text-gray-900">Contact NDIS</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Get in touch with NDIS for questions about your plan or funding.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                Contact Options
              </Button>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-amber-600" size={20} />
                <h3 className="font-medium text-gray-900">Find Providers</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Search for registered NDIS providers in your area.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                Provider Directory
              </Button>
            </div>
          </div>
        </div>
      </Card>

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
              Appointment Title*
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter appointment title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date*
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time*
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider/Person*
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter provider or person name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter appointment location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this appointment"
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
              Add Appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Coordinator Modal */}
      <Modal
        isOpen={showCoordinatorModal}
        onClose={() => setShowCoordinatorModal(false)}
        title={coordinator ? 'Edit Support Coordinator' : 'Add Support Coordinator'}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coordinator Name*
            </label>
            <input
              type="text"
              value={coordinatorData.name}
              onChange={(e) => setCoordinatorData({ ...coordinatorData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter coordinator name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization*
            </label>
            <input
              type="text"
              value={coordinatorData.organization}
              onChange={(e) => setCoordinatorData({ ...coordinatorData, organization: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organization name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={coordinatorData.phone}
                onChange={(e) => setCoordinatorData({ ...coordinatorData, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={coordinatorData.email}
                onChange={(e) => setCoordinatorData({ ...coordinatorData, email: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={coordinatorData.notes}
              onChange={(e) => setCoordinatorData({ ...coordinatorData, notes: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this coordinator"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCoordinatorModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCoordinator}
            >
              {coordinator ? 'Update' : 'Add'} Coordinator
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
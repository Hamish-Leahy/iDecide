import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Calendar
} 
from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface Participant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  ndis_number: string;
  plan_start_date: string;
  plan_end_date: string;
  support_coordinator?: string;
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  image?: string;
  date_of_birth?: string;
}

export function ParticipantManagement() {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    ndis_number: '',
    plan_start_date: '',
    plan_end_date: '',
    support_coordinator: '',
    date_of_birth: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
    notes: '',
    image: ''
  });

  // Load participants from database
  useEffect(() => {
    async function loadParticipants() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Try to load participants from insurance_policies table
        // In a real implementation, you'd have a dedicated participants table
        const { data, error } = await supabase
          .from('insurance_policies')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'ndis');
          
        if (error) throw error;
        
        // Transform the data into participant format
        if (data) {
          const transformedData: Participant[] = data.map(item => ({
            id: item.id,
            name: item.provider || 'NDIS Participant',
            ndis_number: item.ndis_number || item.policy_number,
            plan_start_date: item.plan_start_date || item.start_date,
            plan_end_date: item.plan_end_date || item.renewal_date,
            support_coordinator: item.support_coordinator,
            status: item.status === 'active' ? 'active' : item.status === 'pending' ? 'pending' : 'inactive',
            notes: item.notes,
            email: 'participant@example.com', // Mock data
            phone: '0400 000 000', // Mock data
            address: 'Sydney, Australia', // Mock data
            image: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`
          }));
          
          setParticipants(transformedData);
        }
        
        // If no data is found, add some sample participants
        if (!data || data.length === 0) {
          const sampleParticipants: Participant[] = [
            {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '0412 345 678',
              address: '123 Main St, Sydney NSW 2000',
              ndis_number: 'NDIS12345678',
              plan_start_date: '2025-01-01',
              plan_end_date: '2025-12-31',
              support_coordinator: 'Sarah Johnson',
              status: 'active',
              date_of_birth: '1985-06-15',
              image: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
              id: '2',
              name: 'Emma Wilson',
              email: 'emma.wilson@example.com',
              phone: '0423 456 789',
              address: '45 Park Avenue, Melbourne VIC 3000',
              ndis_number: 'NDIS87654321',
              plan_start_date: '2025-02-01',
              plan_end_date: '2026-01-31',
              support_coordinator: 'David Thompson',
              status: 'active',
              date_of_birth: '1990-03-22',
              image: 'https://randomuser.me/api/portraits/women/44.jpg'
            },
            {
              id: '3',
              name: 'Michael Chen',
              email: 'michael.chen@example.com',
              phone: '0434 567 890',
              address: '78 Bridge Road, Brisbane QLD 4000',
              ndis_number: 'NDIS23456789',
              plan_start_date: '2024-11-15',
              plan_end_date: '2025-11-14',
              support_coordinator: 'Sarah Johnson',
              status: 'pending',
              date_of_birth: '1978-09-10',
              image: 'https://randomuser.me/api/portraits/men/64.jpg'
            },
            {
              id: '4',
              name: 'Olivia Brown',
              email: 'olivia.brown@example.com',
              phone: '0445 678 901',
              address: '12 Ocean Drive, Perth WA 6000',
              ndis_number: 'NDIS34567890',
              plan_start_date: '2024-10-01',
              plan_end_date: '2025-09-30',
              support_coordinator: 'David Thompson',
              status: 'inactive',
              date_of_birth: '1995-12-03',
              image: 'https://randomuser.me/api/portraits/women/67.jpg'
            }
          ];
          
          setParticipants(sampleParticipants);
        }
      } catch (err) {
        console.error('Error loading participants:', err);
        setError(err instanceof Error ? err.message : 'Failed to load participants');
      } finally {
        setLoading(false);
      }
    }
    
    loadParticipants();
  }, [user]);

  const handleAddParticipant = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      ndis_number: '',
      plan_start_date: '',
      plan_end_date: '',
      support_coordinator: '',
      date_of_birth: '',
      status: 'active',
      notes: '',
      image: ''
    });
    setShowAddModal(true);
  };

  const handleEditParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setFormData({
      name: participant.name,
      email: participant.email || '',
      phone: participant.phone || '',
      address: participant.address || '',
      ndis_number: participant.ndis_number,
      plan_start_date: participant.plan_start_date,
      plan_end_date: participant.plan_end_date,
      support_coordinator: participant.support_coordinator || '',
      date_of_birth: participant.date_of_birth || '',
      status: participant.status,
      notes: participant.notes || '',
      image: participant.image || ''
    });
    setShowEditModal(true);
  };

  const handleSaveParticipant = async () => {
    try {
      if (!formData.name || !formData.ndis_number || !formData.plan_start_date || !formData.plan_end_date) {
        setError('Please fill in all required fields');
        return;
      }

      // In a real implementation, you would update the participants table
      // For now, we'll update the array in state
      const newParticipant = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        ndis_number: formData.ndis_number,
        plan_start_date: formData.plan_start_date,
        plan_end_date: formData.plan_end_date,
        support_coordinator: formData.support_coordinator,
        date_of_birth: formData.date_of_birth,
        status: formData.status,
        notes: formData.notes,
        image: formData.image || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`
      };
      
      setParticipants([...participants, newParticipant]);
      setShowAddModal(false);
      setError(null);

      // Create an NDIS insurance policy record for this participant
      if (user) {
        await supabase
          .from('insurance_policies')
          .insert([{
            user_id: user.id,
            type: 'ndis',
            provider: formData.name,
            policy_number: formData.ndis_number,
            coverage_amount: '0',
            premium: '0',
            payment_frequency: 'annually',
            status: formData.status,
            start_date: formData.plan_start_date,
            renewal_date: formData.plan_end_date,
            ndis_number: formData.ndis_number,
            plan_start_date: formData.plan_start_date,
            plan_end_date: formData.plan_end_date,
            plan_manager: 'agency',
            support_coordinator: formData.support_coordinator,
            notes: formData.notes,
            funding_categories: [
              { category: 'Core', amount: '25000', used: '0' },
              { category: 'Capacity Building', amount: '15000', used: '0' },
              { category: 'Capital', amount: '8500', used: '0' }
            ]
          }]);
      }
    } catch (err) {
      console.error('Error saving participant:', err);
      setError(err instanceof Error ? err.message : 'Failed to save participant');
    }
  };

  const handleUpdateParticipant = async () => {
    try {
      if (!selectedParticipant) return;

      // In a real implementation, you would update the participants table
      // For now, we'll update the array in state
      const updatedParticipants = participants.map(participant => 
        participant.id === selectedParticipant.id
          ? { 
              ...participant,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              ndis_number: formData.ndis_number,
              plan_start_date: formData.plan_start_date,
              plan_end_date: formData.plan_end_date,
              support_coordinator: formData.support_coordinator,
              date_of_birth: formData.date_of_birth,
              status: formData.status,
              notes: formData.notes,
              image: formData.image || participant.image
            }
          : participant
      );
      
      setParticipants(updatedParticipants);
      setShowEditModal(false);
      setSelectedParticipant(null);
      setError(null);

      // Update the NDIS insurance policy record for this participant
      if (user) {
        await supabase
          .from('insurance_policies')
          .update({
            provider: formData.name,
            policy_number: formData.ndis_number,
            status: formData.status,
            start_date: formData.plan_start_date,
            renewal_date: formData.plan_end_date,
            ndis_number: formData.ndis_number,
            plan_start_date: formData.plan_start_date,
            plan_end_date: formData.plan_end_date,
            support_coordinator: formData.support_coordinator,
            notes: formData.notes
          })
          .eq('id', selectedParticipant.id)
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error('Error updating participant:', err);
      setError(err instanceof Error ? err.message : 'Failed to update participant');
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this participant? This action cannot be undone.')) {
      try {
        // Remove from state
        setParticipants(participants.filter(participant => participant.id !== id));

        // Delete from database
        if (user) {
          await supabase
            .from('insurance_policies')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
            .eq('type', 'ndis');
        }
      } catch (err) {
        console.error('Error deleting participant:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete participant');
      }
    }
  };

  // Filter participants based on search query and status filter
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.ndis_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
          <p className="text-gray-600 mt-1">
            Manage NDIS participant details and plans
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddParticipant}
          icon={<UserPlus size={20} />}
        >
          Add Participant
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filter Options */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search participants..."
          className="flex-1"
        />
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-3 py-1.5 rounded-md text-sm ${statusFilter === 'all' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm ${statusFilter === 'active' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm ${statusFilter === 'pending' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm ${statusFilter === 'inactive' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 h-24 rounded-lg"></div>
            </div>
          ))
        ) : filteredParticipants.length > 0 ? (
          filteredParticipants.map(participant => (
            <Card key={participant.id} className="hover:shadow transition-shadow">
              <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden">
                    <img 
                      src={participant.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=abd3d2&color=172241`}
                      alt={participant.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{participant.name}</h2>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(participant.status)}`}>
                        {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">NDIS #: {participant.ndis_number}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                      {participant.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail size={14} />
                          <span>{participant.email}</span>
                        </div>
                      )}
                      {participant.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone size={14} />
                          <span>{participant.phone}</span>
                        </div>
                      )}
                      {participant.address && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={14} />
                          <span>{participant.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>Plan: {new Date(participant.plan_start_date).toLocaleDateString()} - {new Date(participant.plan_end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 md:ml-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditParticipant(participant)}
                    icon={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteParticipant(participant.id)}
                    icon={<Trash2 size={16} />}
                    color="danger"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ChevronRight size={16} />}
                    onClick={() => window.location.href = `/dashboard/ndis/plan?id=${participant.id}`}
                  >
                    View Plan
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No participants found</h3>
            <p className="text-gray-500 mt-2 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'No participants match your search criteria.'
                : 'Get started by adding your first NDIS participant.'}
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <Button
                variant="primary"
                onClick={handleAddParticipant}
                icon={<UserPlus size={20} />}
              >
                Add Participant
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add Participant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add NDIS Participant"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NDIS Number*
              </label>
              <input
                type="text"
                value={formData.ndis_number}
                onChange={(e) => setFormData({ ...formData, ndis_number: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="e.g., NDIS12345678"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Start Date*
              </label>
              <input
                type="date"
                value={formData.plan_start_date}
                onChange={(e) => setFormData({ ...formData, plan_start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan End Date*
              </label>
              <input
                type="date"
                value={formData.plan_end_date}
                onChange={(e) => setFormData({ ...formData, plan_end_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="e.g., 0412 345 678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Coordinator
              </label>
              <input
                type="text"
                value={formData.support_coordinator}
                onChange={(e) => setFormData({ ...formData, support_coordinator: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="Name of coordinator"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'pending' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              placeholder="https://example.com/image.jpg"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              placeholder="Additional notes about the participant"
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
              onClick={handleSaveParticipant}
            >
              Add Participant
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Participant Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedParticipant(null);
        }}
        title="Edit NDIS Participant"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NDIS Number*
              </label>
              <input
                type="text"
                value={formData.ndis_number}
                onChange={(e) => setFormData({ ...formData, ndis_number: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="e.g., NDIS12345678"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Start Date*
              </label>
              <input
                type="date"
                value={formData.plan_start_date}
                onChange={(e) => setFormData({ ...formData, plan_start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan End Date*
              </label>
              <input
                type="date"
                value={formData.plan_end_date}
                onChange={(e) => setFormData({ ...formData, plan_end_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="e.g., 0412 345 678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Coordinator
              </label>
              <input
                type="text"
                value={formData.support_coordinator}
                onChange={(e) => setFormData({ ...formData, support_coordinator: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="Name of coordinator"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'pending' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              placeholder="https://example.com/image.jpg"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              placeholder="Additional notes about the participant"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedParticipant(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateParticipant}
            >
              Update Participant
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ParticipantManagement;
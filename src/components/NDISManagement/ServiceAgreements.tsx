import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  Share2, 
  ChevronRight
} 

from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { Badge } from '../common/Badge';

interface Participant {
  id: string;
  name: string;
  ndis_number: string;
}

interface Provider {
  id: string;
  name: string;
  services: string[];
}

interface ServiceAgreement {
  id: string;
  participant_id: string;
  participant_name: string;
  provider_id: string;
  provider_name: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  services: string[];
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  signed_date?: string;
  signed_by?: string;
  notes?: string;
}

export function ServiceAgreements() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<ServiceAgreement | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    participant_id: '',
    provider_id: '',
    start_date: '',
    end_date: '',
    total_amount: '',
    services: [''],
    status: 'draft' as 'draft' | 'active' | 'expired' | 'cancelled',
    signed_date: '',
    signed_by: '',
    notes: ''
  });

  // Load agreements, participants, and providers
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('insurance_policies')
          .select('id, provider, ndis_number')
          .eq('user_id', user.id)
          .eq('type', 'ndis');
        
        if (participantsError) throw participantsError;
        
        const transformedParticipants: Participant[] = (participantsData || []).map(item => ({
          id: item.id,
          name: item.provider || 'NDIS Participant',
          ndis_number: item.ndis_number || ''
        }));
        

        
        setParticipants(finalParticipants);
        
        // Load providers from Supabase
        const { data: providersData, error: providersError } = await supabase
          .from('ndis_service_providers')
          .select('*')
          .eq('user_id', user.id);
        if (providersError) throw providersError;
        setProviders(providersData || []);
        
        // Load service agreements from Supabase
        const { data: agreementsData, error: agreementsError } = await supabase
          .from('ndis_service_agreements')
          .select('*')
          .eq('user_id', user.id);
        if (agreementsError) throw agreementsError;
        setAgreements(agreementsData || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  // Initialize form data when adding a new agreement
  const handleAddAgreement = () => {
    setFormData({
      participant_id: '',
      provider_id: '',
      start_date: '',
      end_date: '',
      total_amount: '',
      services: [''],
      status: 'draft',
      signed_date: '',
      signed_by: '',
      notes: ''
    });
    setCurrentStep(0);
    setShowAddModal(true);
  };

  // Initialize form data when editing an agreement
  const handleEditAgreement = (agreement: ServiceAgreement) => {
    setSelectedAgreement(agreement);
    setFormData({
      participant_id: agreement.participant_id,
      provider_id: agreement.provider_id,
      start_date: agreement.start_date,
      end_date: agreement.end_date,
      total_amount: agreement.total_amount,
      services: agreement.services,
      status: agreement.status,
      signed_date: agreement.signed_date || '',
      signed_by: agreement.signed_by || '',
      notes: agreement.notes || ''
    });
    setShowEditModal(true);
  };

  // View agreement details
  const handleViewAgreement = (agreement: ServiceAgreement) => {
    setSelectedAgreement(agreement);
    setShowViewModal(true);
  };

  // Save a new agreement
  const handleSaveAgreement = () => {
    try {
      // Validate required fields
      if (!formData.participant_id || !formData.provider_id || !formData.start_date || 
          !formData.end_date || !formData.services.some(s => s.trim() !== '')) {
        setError('Please fill in all required fields');
        return;
      }

      // Create new agreement with generated data
      const participant = participants.find(p => p.id === formData.participant_id);
      const provider = providers.find(p => p.id === formData.provider_id);
      
      if (!participant || !provider) {
        setError('Invalid participant or provider selected');
        return;
      }

      const filteredServices = formData.services.filter(s => s.trim() !== '');
      
      const newAgreement: ServiceAgreement = {
        id: Date.now().toString(),
        participant_id: participant.id,
        participant_name: participant.name,
        provider_id: provider.id,
        provider_name: provider.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_amount: formData.total_amount,
        services: filteredServices,
        status: formData.status,
        signed_date: formData.signed_date,
        signed_by: formData.signed_by,
        notes: formData.notes
      };

      setAgreements([...agreements, newAgreement]);
      setShowAddModal(false);
      setCurrentStep(0);
      setError(null);
    } catch (err) {
      console.error('Error saving agreement:', err);
      setError(err instanceof Error ? err.message : 'Failed to save agreement');
    }
  };

  // Update an existing agreement
  const handleUpdateAgreement = () => {
    try {
      if (!selectedAgreement) return;

      // Validate required fields
      if (!formData.participant_id || !formData.provider_id || !formData.start_date || 
          !formData.end_date || !formData.services.some(s => s.trim() !== '')) {
        setError('Please fill in all required fields');
        return;
      }

      // Update agreement with new data
      const participant = participants.find(p => p.id === formData.participant_id);
      const provider = providers.find(p => p.id === formData.provider_id);
      
      if (!participant || !provider) {
        setError('Invalid participant or provider selected');
        return;
      }

      const filteredServices = formData.services.filter(s => s.trim() !== '');
      
      const updatedAgreement: ServiceAgreement = {
        ...selectedAgreement,
        participant_id: participant.id,
        participant_name: participant.name,
        provider_id: provider.id,
        provider_name: provider.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_amount: formData.total_amount,
        services: filteredServices,
        status: formData.status,
        signed_date: formData.signed_date,
        signed_by: formData.signed_by,
        notes: formData.notes
      };

      setAgreements(agreements.map(agreement => 
        agreement.id === selectedAgreement.id ? updatedAgreement : agreement
      ));
      
      setShowEditModal(false);
      setSelectedAgreement(null);
      setError(null);
    } catch (err) {
      console.error('Error updating agreement:', err);
      setError(err instanceof Error ? err.message : 'Failed to update agreement');
    }
  };

  // Delete an agreement
  const handleDeleteAgreement = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service agreement? This action cannot be undone.')) {
      try {
        setAgreements(agreements.filter(agreement => agreement.id !== id));
      } catch (err) {
        console.error('Error deleting agreement:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete agreement');
      }
    }
  };

  // Add another service to the form
  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, '']
    });
  };

  // Remove a service from the form
  const handleRemoveService = (index: number) => {
    if (formData.services.length > 1) {
      const newServices = [...formData.services];
      newServices.splice(index, 1);
      setFormData({
        ...formData,
        services: newServices
      });
    }
  };

  // Update a service in the form
  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData({
      ...formData,
      services: newServices
    });
  };

  // Filter agreements based on search query and status
  const filteredAgreements = agreements.filter(agreement => {
    const matchesSearch = 
      agreement.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get CSS classes for agreement status badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(numAmount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Steps for adding an agreement
  const steps = [
    {
      title: 'Participant & Provider',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participant*
            </label>
            <select
              value={formData.participant_id}
              onChange={(e) => setFormData({ ...formData, participant_id: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              required
            >
              <option value="">Select participant</option>
              {participants.map(participant => (
                <option key={participant.id} value={participant.id}>
                  {participant.name} ({participant.ndis_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Provider*
            </label>
            <select
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              required
            >
              <option value="">Select provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )
    },
    {
      title: 'Services & Dates',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services*
            </label>
            {formData.services.map((service, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                  placeholder="Service name"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  disabled={formData.services.length <= 1}
                  className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddService}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              + Add Another Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Financial Details',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount*
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' | 'expired' | 'cancelled' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed Date
              </label>
              <input
                type="date"
                value={formData.signed_date}
                onChange={(e) => setFormData({ ...formData, signed_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed By
              </label>
              <input
                type="text"
                value={formData.signed_by}
                onChange={(e) => setFormData({ ...formData, signed_by: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="Name of signer"
              />
            </div>
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
              placeholder="Additional notes about the agreement"
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Agreements</h1>
          <p className="text-gray-600 mt-1">
            Create and manage NDIS service agreements
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddAgreement}
          icon={<Plus size={20} />}
        >
          New Agreement
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
          placeholder="Search agreements..."
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
            className={`px-3 py-1.5 rounded-md text-sm ${statusFilter === 'draft' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setStatusFilter('draft')}
          >
            Draft
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-sm ${statusFilter === 'expired' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setStatusFilter('expired')}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Agreements List */}
      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 h-32 rounded-lg"></div>
            </div>
          ))
        ) : filteredAgreements.length > 0 ? (
          filteredAgreements.map(agreement => (
            <Card 
              key={agreement.id} 
              className="hover:shadow transition-shadow cursor-pointer"
              onClick={() => handleViewAgreement(agreement)}
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="flex items-center gap-2 mb-2 md:mb-0">
                    <h2 className="font-semibold text-lg">{agreement.provider_name}</h2>
                    <Badge variant={
                      agreement.status === 'active' ? 'success' :
                      agreement.status === 'draft' ? 'info' :
                      agreement.status === 'expired' ? 'warning' :
                      'danger'
                    }>
                      {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening view modal
                        handleEditAgreement(agreement);
                      }}
                      icon={<Edit size={16} />}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening view modal
                        handleDeleteAgreement(agreement.id);
                      }}
                      icon={<Trash2 size={16} />}
                      color="danger"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Participant</p>
                    <p className="font-medium">{agreement.participant_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {agreement.services.map((service, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">{formatCurrency(agreement.total_amount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      Duration
                    </p>
                    <p className="text-sm">
                      {formatDate(agreement.start_date)} - {formatDate(agreement.end_date)}
                    </p>
                  </div>
                  
                  {agreement.signed_date && (
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Signed
                      </p>
                      <p className="text-sm">
                        {formatDate(agreement.signed_date)} by {agreement.signed_by}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No service agreements found</h3>
            <p className="text-gray-500 mt-2 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'No agreements match your search criteria.'
                : 'Get started by creating your first service agreement.'}
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <Button
                variant="primary"
                onClick={handleAddAgreement}
                icon={<Plus size={20} />}
              >
                New Agreement
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add Agreement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setCurrentStep(0);
        }}
        title={`Create Service Agreement: Step ${currentStep + 1} of ${steps.length}`}
        maxWidth="xl"
      >
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
            <div
              className="bg-idecide-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Step Title */}
          <h3 className="text-xl font-semibold">{steps[currentStep].title}</h3>

          {/* Step Content */}
          {steps[currentStep].component}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 0) {
                  setShowAddModal(false);
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  handleSaveAgreement();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              {currentStep === steps.length - 1 ? 'Create Agreement' : 'Continue'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Agreement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAgreement(null);
        }}
        title="Edit Service Agreement"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant*
              </label>
              <select
                value={formData.participant_id}
                onChange={(e) => setFormData({ ...formData, participant_id: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              >
                <option value="">Select participant</option>
                {participants.map(participant => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name} ({participant.ndis_number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Provider*
              </label>
              <select
                value={formData.provider_id}
                onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              >
                <option value="">Select provider</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services*
            </label>
            {formData.services.map((service, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                  placeholder="Service name"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  disabled={formData.services.length <= 1}
                  className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddService}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              + Add Another Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount*
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' | 'expired' | 'cancelled' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed Date
              </label>
              <input
                type="date"
                value={formData.signed_date}
                onChange={(e) => setFormData({ ...formData, signed_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed By
              </label>
              <input
                type="text"
                value={formData.signed_by}
                onChange={(e) => setFormData({ ...formData, signed_by: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-transparent"
                placeholder="Name of signer"
              />
            </div>
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
              placeholder="Additional notes about the agreement"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedAgreement(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateAgreement}
            >
              Update Agreement
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Agreement Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAgreement(null);
        }}
        title="Service Agreement Details"
        maxWidth="xl"
      >
        {selectedAgreement && (
          <div className="space-y-6">
            {/* Header with controls */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{selectedAgreement.provider_name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedAgreement.status)}`}>
                  {selectedAgreement.status.charAt(0).toUpperCase() + selectedAgreement.status.slice(1)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={<Download size={16} />}
                >
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={<Share2 size={16} />}
                >
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={<Edit size={16} />}
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditAgreement(selectedAgreement);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm text-gray-500">Participant</p>
                <p className="font-medium">{selectedAgreement.participant_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium">{selectedAgreement.provider_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">{formatCurrency(selectedAgreement.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={14} />
                  Agreement Period
                </p>
                <p className="text-sm">
                  {formatDate(selectedAgreement.start_date)} - {formatDate(selectedAgreement.end_date)}
                </p>
              </div>
              {selectedAgreement.signed_date && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Signed
                  </p>
                  <p className="text-sm">
                    {formatDate(selectedAgreement.signed_date)} by {selectedAgreement.signed_by}
                  </p>
                </div>
              )}
            </div>

            {/* Services */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Agreed Services</h3>
              <div className="space-y-2">
                {selectedAgreement.services.map((service, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-white border rounded-lg flex items-center justify-between"
                  >
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            {selectedAgreement.notes && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-gray-700">{selectedAgreement.notes}</p>
                </div>
              </div>
            )}

            {/* Agreement Preview */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Agreement Document</h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileText size={14} />}
                >
                  View Full Document
                </Button>
              </div>
              <div className="h-60 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Document preview will appear here</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ServiceAgreements;
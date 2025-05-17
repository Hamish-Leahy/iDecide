import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  X 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface ServiceProvider {
  id: string;
  name: string;
  services: string[];
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  agreement_status: 'active' | 'pending' | 'expired' | 'none';
  notes?: string;
}

export function ServiceProviders() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    services: [''],
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    agreement_status: 'none' as 'active' | 'pending' | 'expired' | 'none',
    notes: ''
  });

  // Common service types
  const commonServiceTypes = [
    'Personal Care',
    'Community Access',
    'Assistive Technology',
    'Home Modifications',
    'Occupational Therapy',
    'Speech Therapy',
    'Physiotherapy',
    'Support Coordination',
    'Transport',
    'Cleaning',
    'Meal Preparation',
    'Social Support'
  ];

  useEffect(() => {
    const loadProviders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // In a real app, you would fetch from a service_providers table
        // For now, we'll use mock data
        
        // Mock service providers
        const mockProviders: ServiceProvider[] = [
          {
            id: '1',
            name: 'Sunshine Support Services',
            services: ['Personal Care', 'Community Access'],
            contact_name: 'Sarah Johnson',
            phone: '0412 345 678',
            email: 'contact@sunshinesupport.com.au',
            address: '123 Main Street, Sydney NSW 2000',
            agreement_status: 'active',
            notes: 'Provides support workers Monday to Friday'
          },
          {
            id: '2',
            name: 'Mobility Solutions',
            services: ['Assistive Technology', 'Home Modifications'],
            contact_name: 'Michael Chen',
            phone: '0423 456 789',
            email: 'info@mobilitysolutions.com.au',
            address: '45 Tech Lane, Melbourne VIC 3000',
            agreement_status: 'active',
            notes: 'Specializes in mobility equipment and home modifications'
          },
          {
            id: '3',
            name: 'Therapy Connect',
            services: ['Occupational Therapy', 'Speech Therapy'],
            contact_name: 'Emma Wilson',
            phone: '0434 567 890',
            email: 'admin@therapyconnect.com.au',
            address: '78 Health Avenue, Brisbane QLD 4000',
            agreement_status: 'pending',
            notes: 'Provides both in-clinic and home visit therapy services'
          },
          {
            id: '4',
            name: 'Community Inclusion Group',
            services: ['Community Access', 'Social Support'],
            contact_name: 'David Thompson',
            phone: '0445 678 901',
            email: 'info@communityinclusion.org.au',
            address: '90 Social Street, Perth WA 6000',
            agreement_status: 'expired',
            notes: 'Focuses on community participation and social activities'
          },
          {
            id: '5',
            name: 'Home Care Plus',
            services: ['Cleaning', 'Meal Preparation', 'Personal Care'],
            contact_name: 'Lisa Brown',
            phone: '0456 789 012',
            email: 'service@homecareplus.com.au',
            address: '34 Care Road, Adelaide SA 5000',
            agreement_status: 'active',
            notes: 'Provides comprehensive in-home support services'
          }
        ];
        
        setProviders(mockProviders);
      } catch (err) {
        console.error('Error loading service providers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service providers');
      } finally {
        setLoading(false);
      }
    };
    
    loadProviders();
  }, [user]);

  const handleAddProvider = () => {
    setFormData({
      name: '',
      services: [''],
      contact_name: '',
      phone: '',
      email: '',
      address: '',
      agreement_status: 'none',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setFormData({
      name: provider.name,
      services: provider.services,
      contact_name: provider.contact_name || '',
      phone: provider.phone || '',
      email: provider.email || '',
      address: provider.address || '',
      agreement_status: provider.agreement_status,
      notes: provider.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteProvider = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service provider?')) {
      setProviders(providers.filter(provider => provider.id !== id));
    }
  };

  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, '']
    });
  };

  const handleRemoveService = (index: number) => {
    const newServices = [...formData.services];
    newServices.splice(index, 1);
    setFormData({
      ...formData,
      services: newServices
    });
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData({
      ...formData,
      services: newServices
    });
  };

  const handleSaveProvider = () => {
    // Validate form
    if (!formData.name) {
      setError('Provider name is required');
      return;
    }
    
    if (formData.services.some(service => !service)) {
      setError('All services must have a name');
      return;
    }
    
    // Filter out empty services
    const filteredServices = formData.services.filter(service => service);
    
    if (showEditModal && selectedProvider) {
      // Update existing provider
      const updatedProvider = {
        ...selectedProvider,
        name: formData.name,
        services: filteredServices,
        contact_name: formData.contact_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        agreement_status: formData.agreement_status,
        notes: formData.notes
      };
      
      setProviders(providers.map(provider => 
        provider.id === selectedProvider.id ? updatedProvider : provider
      ));
      
      setShowEditModal(false);
    } else {
      // Add new provider
      const newProvider: ServiceProvider = {
        id: Date.now().toString(),
        name: formData.name,
        services: filteredServices,
        contact_name: formData.contact_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        agreement_status: formData.agreement_status,
        notes: formData.notes
      };
      
      setProviders([...providers, newProvider]);
      setShowAddModal(false);
    }
    
    setError(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X size={12} className="mr-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            No Agreement
          </span>
        );
    }
  };

  const filteredProviders = providers.filter(provider => {
    const searchLower = searchQuery.toLowerCase();
    return (
      provider.name.toLowerCase().includes(searchLower) ||
      provider.services.some(service => service.toLowerCase().includes(searchLower)) ||
      provider.contact_name?.toLowerCase().includes(searchLower) ||
      provider.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600 mt-1">Manage your NDIS service providers</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddProvider}
          icon={<Plus size={20} />}
        >
          Add Provider
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search providers..."
          className="flex-1"
        />
        <Button
          variant="outline"
          icon={<Filter size={20} />}
        >
          Filter
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Service Providers</h2>
          
          {filteredProviders.length > 0 ? (
            <div className="space-y-4">
              {filteredProviders.map(provider => (
                <div key={provider.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Users className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{provider.name}</h3>
                          {getStatusBadge(provider.agreement_status)}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.services.map((service, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                              {service}
                            </span>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                          {provider.contact_name && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users size={14} />
                              <span>{provider.contact_name}</span>
                            </div>
                          )}
                          
                          {provider.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone size={14} />
                              <a href={`tel:${provider.phone}`} className="hover:text-indigo-600">
                                {provider.phone}
                              </a>
                            </div>
                          )}
                          
                          {provider.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail size={14} />
                              <a href={`mailto:${provider.email}`} className="hover:text-indigo-600">
                                {provider.email}
                              </a>
                            </div>
                          )}
                          
                          {provider.address && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin size={14} />
                              <span className="truncate">{provider.address}</span>
                            </div>
                          )}
                        </div>
                        
                        {provider.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{provider.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProvider(provider)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                        title="Edit provider"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                        title="Delete provider"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No service providers</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No providers match your search' : 'Get started by adding a new service provider'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={handleAddProvider}
                    icon={<Plus size={20} />}
                  >
                    Add Provider
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Add Provider Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Service Provider"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider Name*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter provider name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services Provided*
            </label>
            {formData.services.map((service, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="flex-1">
                  <select
                    value={service}
                    onChange={(e) => handleServiceChange(index, e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a service</option>
                    {commonServiceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    <option value="custom">Custom Service...</option>
                  </select>
                  {service === 'custom' && (
                    <input
                      type="text"
                      placeholder="Enter custom service name"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded"
                  disabled={formData.services.length <= 1}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddService}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Another Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Agreement Status
              </label>
              <select
                value={formData.agreement_status}
                onChange={(e) => setFormData({ ...formData, agreement_status: e.target.value as any })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Agreement</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter provider address"
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
              placeholder="Add any notes about this provider"
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
              onClick={handleSaveProvider}
            >
              Add Provider
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Provider Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Service Provider"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider Name*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter provider name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services Provided*
            </label>
            {formData.services.map((service, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="flex-1">
                  <select
                    value={commonServiceTypes.includes(service) ? service : 'custom'}
                    onChange={(e) => handleServiceChange(index, e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a service</option>
                    {commonServiceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    <option value="custom">Custom Service...</option>
                  </select>
                  {!commonServiceTypes.includes(service) && (
                    <input
                      type="text"
                      value={service}
                      placeholder="Enter custom service name"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded"
                  disabled={formData.services.length <= 1}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddService}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Another Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Agreement Status
              </label>
              <select
                value={formData.agreement_status}
                onChange={(e) => setFormData({ ...formData, agreement_status: e.target.value as any })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Agreement</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter provider address"
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
              placeholder="Add any notes about this provider"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveProvider}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper component for the Clock icon
function Clock({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
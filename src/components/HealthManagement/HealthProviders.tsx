import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Trash2, AlertCircle, Mail, Phone, Calendar, Star, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchIn,.put } from '../common/SearchInput';
import { motion } from 'framer-motion';

interface HealthProvider {
  id: string;
  name: string;
  specialty: string;
  practice_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  is_primary: boolean;
  last_visit?: string;
  next_visit?: string;
}

export function HealthProviders() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<HealthProvider[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<HealthProvider | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialty: 'primary_care',
    practice_name: '',
    address: '',
    phone: '',
    email: '',
    notes: '',
    is_primary: false,
    last_visit: '',
    next_visit: ''
  });

  const specialties = [
    { value: 'primary_care', label: 'Primary Care', icon: Stethoscope },
    { value: 'specialist', label: 'Specialist', icon: Stethoscope },
    { value: 'dentist', label: 'Dentist', icon: Tooth },
    { value: 'optometrist', label: 'Optometrist', icon: Eye },
    { value: 'mental_health', label: 'Mental Health', icon: Brain },
    { value: 'physical_therapy', label: 'Physical Therapy', icon: Activity },
    { value: 'other', label: 'Other', icon: Stethoscope }
  ];

  useEffect(() => {
    if (user) {
      loadProviders();
    }
  }, [user]);

  async function loadProviders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_providers')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveProvider = async () => {
    try {
      // If setting as primary, update existing primary provider
      if (formData.is_primary) {
        await supabase
          .from('health_providers')
          .update({ is_primary: false })
          .eq('user_id', user?.id)
          .eq('specialty', formData.specialty);
      }

      const { data, error } = await supabase
        .from('health_providers')
        .insert([{
          ...formData,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setProviders(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        name: '',
        specialty: 'primary_care',
        practice_name: '',
        address: '',
        phone: '',
        email: '',
        notes: '',
        is_primary: false,
        last_visit: '',
        next_visit: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provider');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProviders(prev => prev.filter(provider => provider.id !== id));
      if (selectedProvider?.id === id) {
        setSelectedProvider(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  const handleViewProvider = (provider: HealthProvider) => {
    setSelectedProvider(provider);
    setShowDetailModal(true);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.practice_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || provider.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const getSpecialtyIcon = (specialty: string) => {
    const specialtyInfo = specialties.find(s => s.value === specialty);
    const Icon = specialtyInfo?.icon || Stethoscope;
    return <Icon size={20} />;
  };

  const getSpecialtyLabel = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.label || specialty;
  };

  // Group providers by specialty
  const providersBySpecialty = filteredProviders.reduce((acc, provider) => {
    if (!acc[provider.specialty]) {
      acc[provider.specialty] = [];
    }
    acc[provider.specialty].push(provider);
    return acc;
  }, {} as Record<string, HealthProvider[]>);

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
          <h1 className="text-2xl font-bold text-gray-900">Healthcare Providers</h1>
          <p className="text-gray-600 mt-1">Manage your healthcare team</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Provider
        </Button>
      </div>

      {/* Healthcare Team Design */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100 shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Stethoscope className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Healthcare Team</h2>
            <p className="text-gray-600">All your medical professionals in one place</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4 shadow-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search providers..."
            className="flex-1"
          />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty.value} value={specialty.value}>
                {specialty.label}
              </option>
            ))}
          </select>
        </div>

        {/* Provider Cards */}
        {Object.keys(providersBySpecialty).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(providersBySpecialty).map(([specialty, specialtyProviders]) => (
              <div key={specialty} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className={`p-4 ${
                  specialty === 'primary_care' ? 'bg-blue-600' :
                  specialty === 'specialist' ? 'bg-purple-600' :
                  specialty === 'dentist' ? 'bg-cyan-600' :
                  specialty === 'optometrist' ? 'bg-teal-600' :
                  specialty === 'mental_health' ? 'bg-pink-600' :
                  specialty === 'physical_therapy' ? 'bg-orange-600' :
                  'bg-gray-600'
                } text-white`}>
                  <div className="flex items-center gap-2">
                    {getSpecialtyIcon(specialty)}
                    <h3 className="text-lg font-semibold">{getSpecialtyLabel(specialty)}</h3>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialtyProviders.map(provider => (
                    <motion.div
                      key={provider.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`bg-white rounded-lg p-4 cursor-pointer border ${
                        provider.is_primary 
                          ? 'border-indigo-300 shadow-md' 
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                      onClick={() => handleViewProvider(provider)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                            {provider.is_primary && (
                              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          {provider.practice_name && (
                            <p className="text-sm text-gray-500 mt-1">
                              {provider.practice_name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProvider(provider.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {provider.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            <a href={`tel:${provider.phone}`} className="hover:text-indigo-600">
                              {provider.phone}
                            </a>
                          </div>
                        )}
                        
                        {provider.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            <a href={`mailto:${provider.email}`} className="hover:text-indigo-600">
                              {provider.email}
                            </a>
                          </div>
                        )}
                        
                        {provider.next_visit && (
                          <div className="flex items-center gap-2 text-sm text-indigo-600 mt-2">
                            <Calendar size={14} />
                            <span>Next visit: {new Date(provider.next_visit).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Providers Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'No providers match your search criteria'
                : 'You haven\'t added any healthcare providers yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Provider
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Healthcare Provider"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter provider's full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialty
            </label>
            <select
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {specialties.map(specialty => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Practice Name
            </label>
            <input
              type="text"
              value={formData.practice_name}
              onChange={(e) => setFormData({ ...formData, practice_name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter practice or clinic name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Enter practice address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="(123) 456-7890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="provider@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Visit
              </label>
              <input
                type="date"
                value={formData.last_visit}
                onChange={(e) => setFormData({ ...formData, last_visit: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Visit
              </label>
              <input
                type="date"
                value={formData.next_visit}
                onChange={(e) => setFormData({ ...formData, next_visit: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Set as primary provider for this specialty</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Additional notes about this provider"
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
              Save Provider
            </Button>
          </div>
        </div>
      </Modal>

      {/* Provider Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedProvider ? `Dr. ${selectedProvider.name}` : 'Provider Details'}
        maxWidth="xl"
      >
        {selectedProvider && (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-full ${
                  selectedProvider.specialty === 'primary_care' ? 'bg-blue-100 text-blue-600' :
                  selectedProvider.specialty === 'specialist' ? 'bg-purple-100 text-purple-600' :
                  selectedProvider.specialty === 'dentist' ? 'bg-cyan-100 text-cyan-600' :
                  selectedProvider.specialty === 'optometrist' ? 'bg-teal-100 text-teal-600' :
                  selectedProvider.specialty === 'mental_health' ? 'bg-pink-100 text-pink-600' :
                  selectedProvider.specialty === 'physical_therapy' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getSpecialtyIcon(selectedProvider.specialty)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{selectedProvider.name}</h3>
                    {selectedProvider.is_primary && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-600">{getSpecialtyLabel(selectedProvider.specialty)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {selectedProvider.practice_name && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Practice</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Building size={18} className="text-indigo-500" />
                        <span>{selectedProvider.practice_name}</span>
                      </div>
                    </div>
                  )}

                  {selectedProvider.address && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                      <div className="flex items-start gap-2 text-gray-900">
                        <MapPin size={18} className="text-indigo-500 flex-shrink-0 mt-1" />
                        <span>{selectedProvider.address}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedProvider.phone && (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Phone size={18} className="text-indigo-500" />
                        <a href={`tel:${selectedProvider.phone}`} className="hover:text-indigo-600">
                          {selectedProvider.phone}
                        </a>
                      </div>
                    )}
                    
                    {selectedProvider.email && (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Mail size={18} className="text-indigo-500" />
                        <a href={`mailto:${selectedProvider.email}`} className="hover:text-indigo-600">
                          {selectedProvider.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedProvider.last_visit && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Last Visit</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={18} className="text-indigo-500" />
                        <span>{new Date(selectedProvider.last_visit).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedProvider.next_visit && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Next Visit</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={18} className="text-indigo-500" />
                        <span>{new Date(selectedProvider.next_visit).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {selectedProvider.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-gray-700">
                        {selectedProvider.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                color="danger"
                onClick={() => {
                  handleDeleteProvider(selectedProvider.id);
                }}
              >
                Delete Provider
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

// Helper components for this file only
function Tooth({ size, className }: { size: number, className?: string }) {
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
      <path d="M12 5.5c-1.5-2-3-2.5-4-2.5-3 0-5 2.5-5 5 0 2.5 2 3.5 2 5s-2 2.5-2 5c0 2.5 2 4.5 5 4.5 1 0 2.5-.5 4-2.5 1.5 2 3 2.5 4 2.5 3 0 5-2 5-4.5 0-2.5-2-3.5-2-5s2-2.5 2-5c0-2.5-2-5-5-5-1 0-2.5.5-4 2.5z"></path>
    </svg>
  );
}

function Eye({ size, className }: { size: number, className?: string }) {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function Brain({ size, className }: { size: number, className?: string }) {
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
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
  );
}

function Activity({ size, className }: { size: number, className?: string }) {
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
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function Building({ size, className }: { size: number, className?: string }) {
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
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M12 6h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M16 14h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M8 14h.01"></path>
    </svg>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Calendar, Syringe, Shield, CheckCircle, X, Thermometer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { motion } from 'framer-motion';

interface Immunization {
  id: string;
  vaccine_name: string;
  date_administered: string;
  provider_id?: string;
  lot_number?: string;
  manufacturer?: string;
  next_dose_due?: string;
  notes?: string;
  provider?: {
    name: string;
    practice_name?: string;
  };
}

export function Immunizations() {
  const { user } = useAuth();
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedImmunization, setSelectedImmunization] = useState<Immunization | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    vaccine_name: '',
    date_administered: '',
    provider_id: '',
    lot_number: '',
    manufacturer: '',
    next_dose_due: '',
    notes: ''
  });

  // Common vaccines
  const commonVaccines = [
    'COVID-19',
    'Influenza (Flu)',
    'Tetanus/Diphtheria/Pertussis (Tdap)',
    'Measles/Mumps/Rubella (MMR)',
    'Hepatitis A',
    'Hepatitis B',
    'Human Papillomavirus (HPV)',
    'Pneumococcal',
    'Shingles (Zoster)',
    'Varicella (Chickenpox)'
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [immunizationsResponse, providersResponse] = await Promise.all([
        supabase
          .from('immunizations')
          .select(`
            *,
            provider:provider_id (
              name,
              practice_name
            )
          `)
          .eq('user_id', user?.id)
          .order('date_administered', { ascending: false }),
        supabase
          .from('health_providers')
          .select('id, name, practice_name')
          .eq('user_id', user?.id)
      ]);

      if (immunizationsResponse.error) throw immunizationsResponse.error;
      if (providersResponse.error) throw providersResponse.error;

      setImmunizations(immunizationsResponse.data || []);
      setProviders(providersResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load immunizations');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveImmunization = async () => {
    try {
      const { data, error } = await supabase
        .from('immunizations')
        .insert([{
          ...formData,
          user_id: user?.id
        }])
        .select(`
          *,
          provider:provider_id (
            name,
            practice_name
          )
        `)
        .single();

      if (error) throw error;

      setImmunizations(prev => [data, ...prev]);
      setShowAddModal(false);
      setFormData({
        vaccine_name: '',
        date_administered: '',
        provider_id: '',
        lot_number: '',
        manufacturer: '',
        next_dose_due: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save immunization');
    }
  };

  const handleDeleteImmunization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('immunizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setImmunizations(prev => prev.filter(immunization => immunization.id !== id));
      if (selectedImmunization?.id === id) {
        setSelectedImmunization(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete immunization');
    }
  };

  const handleViewImmunization = (immunization: Immunization) => {
    setSelectedImmunization(immunization);
    setShowDetailModal(true);
  };

  const filteredImmunizations = immunizations.filter(immunization =>
    immunization.vaccine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    immunization.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group immunizations by year
  const groupedImmunizations = filteredImmunizations.reduce((acc, immunization) => {
    const year = new Date(immunization.date_administered).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(immunization);
    return acc;
  }, {} as Record<number, Immunization[]>);

  // Sort years in descending order
  const sortedYears = Object.keys(groupedImmunizations)
    .map(year => parseInt(year))
    .sort((a, b) => b - a);

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
          <h1 className="text-2xl font-bold text-gray-900">Immunizations</h1>
          <p className="text-gray-600 mt-1">Track your vaccination history</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Immunization
        </Button>
      </div>

      {/* Immunization Record Design */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-100 shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Syringe className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Immunization Record</h2>
            <p className="text-gray-600">Your complete vaccination history</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search immunizations..."
            className="w-full"
          />
        </div>

        {/* Immunization Cards */}
        {sortedYears.length > 0 ? (
          <div className="space-y-8">
            {sortedYears.map(year => (
              <div key={year} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-green-600 text-white p-4">
                  <h3 className="text-lg font-semibold">{year}</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedImmunizations[year].map(immunization => (
                    <motion.div
                      key={immunization.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-green-50 rounded-lg p-4 cursor-pointer border border-green-100"
                      onClick={() => handleViewImmunization(immunization)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Syringe className="text-green-600" size={18} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{immunization.vaccine_name}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(immunization.date_administered).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImmunization(immunization.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-3 pl-11 space-y-1">
                        {immunization.manufacturer && (
                          <p className="text-sm text-gray-600">
                            Manufacturer: {immunization.manufacturer}
                          </p>
                        )}
                        
                        {immunization.provider && (
                          <p className="text-sm text-gray-600">
                            Provider: {immunization.provider.name}
                          </p>
                        )}
                        
                        {immunization.next_dose_due && (
                          <div className="flex items-center gap-1 text-sm text-green-700 mt-2">
                            <Calendar size={14} />
                            <span>Next dose: {new Date(immunization.next_dose_due).toLocaleDateString()}</span>
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Syringe className="text-green-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Immunizations Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'No immunizations match your search criteria'
                : 'You haven\'t added any immunizations yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Immunization
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Immunization Status */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Immunization Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="text-green-500" size={20} />
                <span className="text-gray-900">COVID-19</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                immunizations.some(i => i.vaccine_name.toLowerCase().includes('covid'))
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {immunizations.some(i => i.vaccine_name.toLowerCase().includes('covid'))
                  ? 'Up to date'
                  : 'Not recorded'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="text-green-500" size={20} />
                <span className="text-gray-900">Influenza (Flu)</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                immunizations.some(i => i.vaccine_name.toLowerCase().includes('flu') || i.vaccine_name.toLowerCase().includes('influenza'))
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {immunizations.some(i => i.vaccine_name.toLowerCase().includes('flu') || i.vaccine_name.toLowerCase().includes('influenza'))
                  ? 'Up to date'
                  : 'Not recorded'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="text-green-500" size={20} />
                <span className="text-gray-900">Tetanus (Tdap)</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                immunizations.some(i => 
                  i.vaccine_name.toLowerCase().includes('tetanus') || 
                  i.vaccine_name.toLowerCase().includes('tdap') ||
                  i.vaccine_name.toLowerCase().includes('td')
                )
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {immunizations.some(i => 
                  i.vaccine_name.toLowerCase().includes('tetanus') || 
                  i.vaccine_name.toLowerCase().includes('tdap') ||
                  i.vaccine_name.toLowerCase().includes('td')
                )
                  ? 'Up to date'
                  : 'Not recorded'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Immunization Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Immunization"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vaccine Name
            </label>
            <select
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select vaccine or enter custom</option>
              {commonVaccines.map(vaccine => (
                <option key={vaccine} value={vaccine}>
                  {vaccine}
                </option>
              ))}
            </select>
            {formData.vaccine_name === '' && (
              <input
                type="text"
                placeholder="Enter custom vaccine name"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 mt-2"
                onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Administered
            </label>
            <input
              type="date"
              value={formData.date_administered}
              onChange={(e) => setFormData({ ...formData, date_administered: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Healthcare Provider
            </label>
            <select
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} {provider.practice_name ? `(${provider.practice_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Pfizer, Moderna, Johnson & Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lot Number
            </label>
            <input
              type="text"
              value={formData.lot_number}
              onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter vaccine lot number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Dose Due
            </label>
            <input
              type="date"
              value={formData.next_dose_due}
              onChange={(e) => setFormData({ ...formData, next_dose_due: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Additional notes about the immunization"
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
              onClick={handleSaveImmunization}
            >
              Save Immunization
            </Button>
          </div>
        </div>
      </Modal>

      {/* Immunization Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Immunization Details"
        maxWidth="xl"
      >
        {selectedImmunization && (
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <Syringe className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedImmunization.vaccine_name}</h3>
                  <p className="text-green-600">
                    Administered on {new Date(selectedImmunization.date_administered).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {selectedImmunization.provider && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Provider</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Stethoscope size={18} className="text-green-500" />
                        <span>{selectedImmunization.provider.name}</span>
                      </div>
                      {selectedImmunization.provider.practice_name && (
                        <p className="text-sm text-gray-500 ml-6 mt-1">
                          {selectedImmunization.provider.practice_name}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedImmunization.manufacturer && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Manufacturer</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Building size={18} className="text-green-500" />
                        <span>{selectedImmunization.manufacturer}</span>
                      </div>
                    </div>
                  )}

                  {selectedImmunization.lot_number && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Lot Number</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Barcode size={18} className="text-green-500" />
                        <span>{selectedImmunization.lot_number}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedImmunization.next_dose_due && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Next Dose Due</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={18} className="text-green-500" />
                        <span>{new Date(selectedImmunization.next_dose_due).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {selectedImmunization.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-gray-700">
                        {selectedImmunization.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Shield size={18} />
                  <span className="font-medium">Immunity Status</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  This vaccination provides protection against {selectedImmunization.vaccine_name.split('(')[0].trim()}.
                  {selectedImmunization.next_dose_due && (
                    <> Your next dose is due on {new Date(selectedImmunization.next_dose_due).toLocaleDateString()}.</>
                  )}
                </p>
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
                  handleDeleteImmunization(selectedImmunization.id);
                }}
              >
                Delete Record
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

function Barcode({ size, className }: { size: number, className?: string }) {
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
      <path d="M3 5v14"></path>
      <path d="M8 5v14"></path>
      <path d="M12 5v14"></path>
      <path d="M17 5v14"></path>
      <path d="M21 5v14"></path>
    </svg>
  );
}
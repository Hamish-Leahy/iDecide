import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, AlertCircle, Calendar, Clock, RefreshCw, CheckCircle, X, AlarmClock, Repeat, Droplet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { motion } from 'framer-motion';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date?: string;
  end_date?: string;
  prescribing_provider?: string;
  pharmacy?: string;
  refills_remaining?: number;
  next_refill_date?: string;
  side_effects?: string;
  notes?: string;
  status: 'active' | 'discontinued' | 'completed';
}

export function Medications() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    prescribing_provider: '',
    pharmacy: '',
    refills_remaining: '',
    next_refill_date: '',
    side_effects: '',
    notes: '',
    status: 'active' as const
  });

  const frequencies = [
    { value: 'once_daily', label: 'Once Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'three_times_daily', label: 'Three Times Daily' },
    { value: 'four_times_daily', label: 'Four Times Daily' },
    { value: 'as_needed', label: 'As Needed' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (user) {
      loadMedications();
    }
  }, [user]);

  async function loadMedications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setMedications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveMedication = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          ...formData,
          user_id: user?.id,
          refills_remaining: formData.refills_remaining ? parseInt(formData.refills_remaining) : null
        }])
        .select()
        .single();

      if (error) throw error;

      setMedications(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: '',
        prescribing_provider: '',
        pharmacy: '',
        refills_remaining: '',
        next_refill_date: '',
        side_effects: '',
        notes: '',
        status: 'active'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medication');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMedications(prev => prev.filter(medication => medication.id !== id));
      if (selectedMedication?.id === id) {
        setSelectedMedication(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medication');
    }
  };

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowDetailModal(true);
  };

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = 
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.pharmacy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.prescribing_provider?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || medication.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getFrequencyLabel = (frequencyValue: string) => {
    return frequencies.find(f => f.value === frequencyValue)?.label || frequencyValue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600 mt-1">Track your medications and prescriptions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Medication
        </Button>
      </div>

      {/* Pill Bottle Rack Design */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Pill className="text-purple-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Medication Cabinet</h2>
            <p className="text-gray-600">Keep track of all your prescriptions</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4 shadow-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search medications..."
            className="flex-1"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="discontinued">Discontinued</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Medication Pill Bottles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedications.length > 0 ? (
            filteredMedications.map(medication => (
              <motion.div
                key={medication.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer border-t-8 ${
                  medication.status === 'active' ? 'border-green-500' :
                  medication.status === 'discontinued' ? 'border-red-500' :
                  'border-blue-500'
                }`}
                onClick={() => handleViewMedication(medication)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{medication.name}</h3>
                      <p className="text-sm text-gray-500">{medication.dosage}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedication(medication.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{getFrequencyLabel(medication.frequency)}</span>
                    </div>
                    
                    {medication.refills_remaining !== null && medication.refills_remaining !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <RefreshCw size={16} />
                        <span>Refills: {medication.refills_remaining}</span>
                      </div>
                    )}
                    
                    {medication.next_refill_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>Next refill: {new Date(medication.next_refill_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(medication.status)}`}>
                    {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">Click for details</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="text-purple-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Medications Found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? 'No medications match your search criteria'
                  : 'You haven\'t added any medications yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Medication
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Medication Schedule */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Medication Schedule</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlarmClock className="text-blue-600" size={20} />
                  <span className="font-medium text-blue-900">Morning</span>
                </div>
                {medications.filter(m => 
                  m.status === 'active' && 
                  (m.frequency === 'once_daily' || 
                   m.frequency === 'twice_daily' || 
                   m.frequency === 'three_times_daily' || 
                   m.frequency === 'four_times_daily')
                ).length > 0 ? (
                  <ul className="space-y-2">
                    {medications
                      .filter(m => 
                        m.status === 'active' && 
                        (m.frequency === 'once_daily' || 
                         m.frequency === 'twice_daily' || 
                         m.frequency === 'three_times_daily' || 
                         m.frequency === 'four_times_daily')
                      )
                      .map(med => (
                        <li key={med.id} className="flex items-center gap-2">
                          <Pill size={14} className="text-blue-600" />
                          <span className="text-sm">{med.name} ({med.dosage})</span>
                        </li>
                      ))
                    }
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No morning medications</p>
                )}
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlarmClock className="text-amber-600" size={20} />
                  <span className="font-medium text-amber-900">Afternoon</span>
                </div>
                {medications.filter(m => 
                  m.status === 'active' && 
                  (m.frequency === 'twice_daily' || 
                   m.frequency === 'three_times_daily' || 
                   m.frequency === 'four_times_daily')
                ).length > 0 ? (
                  <ul className="space-y-2">
                    {medications
                      .filter(m => 
                        m.status === 'active' && 
                        (m.frequency === 'twice_daily' || 
                         m.frequency === 'three_times_daily' || 
                         m.frequency === 'four_times_daily')
                      )
                      .map(med => (
                        <li key={med.id} className="flex items-center gap-2">
                          <Pill size={14} className="text-amber-600" />
                          <span className="text-sm">{med.name} ({med.dosage})</span>
                        </li>
                      ))
                    }
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No afternoon medications</p>
                )}
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlarmClock className="text-indigo-600" size={20} />
                  <span className="font-medium text-indigo-900">Evening</span>
                </div>
                {medications.filter(m => 
                  m.status === 'active' && 
                  (m.frequency === 'once_daily' || 
                   m.frequency === 'twice_daily' || 
                   m.frequency === 'three_times_daily' || 
                   m.frequency === 'four_times_daily')
                ).length > 0 ? (
                  <ul className="space-y-2">
                    {medications
                      .filter(m => 
                        m.status === 'active' && 
                        (m.frequency === 'once_daily' || 
                         m.frequency === 'twice_daily' || 
                         m.frequency === 'three_times_daily' || 
                         m.frequency === 'four_times_daily')
                      )
                      .map(med => (
                        <li key={med.id} className="flex items-center gap-2">
                          <Pill size={14} className="text-indigo-600" />
                          <span className="text-sm">{med.name} ({med.dosage})</span>
                        </li>
                      ))
                    }
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No evening medications</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="text-gray-600" size={20} />
                <span className="font-medium text-gray-900">Other Schedules</span>
              </div>
              {medications.filter(m => 
                m.status === 'active' && 
                (m.frequency === 'as_needed' || 
                 m.frequency === 'weekly' || 
                 m.frequency === 'monthly' || 
                 m.frequency === 'other')
              ).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medications
                    .filter(m => 
                      m.status === 'active' && 
                      (m.frequency === 'as_needed' || 
                       m.frequency === 'weekly' || 
                       m.frequency === 'monthly' || 
                       m.frequency === 'other')
                    )
                    .map(med => (
                      <div key={med.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Pill size={16} className="text-gray-600" />
                          <span className="font-medium">{med.name} ({med.dosage})</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{getFrequencyLabel(med.frequency)}</p>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-sm text-gray-500">No other scheduled medications</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Add Medication Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Medication"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter medication name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage
            </label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 50mg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select frequency</option>
              {frequencies.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescribing Provider
            </label>
            <input
              type="text"
              value={formData.prescribing_provider}
              onChange={(e) => setFormData({ ...formData, prescribing_provider: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Doctor's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pharmacy
            </label>
            <input
              type="text"
              value={formData.pharmacy}
              onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Pharmacy name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refills Remaining
              </label>
              <input
                type="number"
                value={formData.refills_remaining}
                onChange={(e) => setFormData({ ...formData, refills_remaining: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Number of refills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Refill Date
              </label>
              <input
                type="date"
                value={formData.next_refill_date}
                onChange={(e) => setFormData({ ...formData, next_refill_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Side Effects
            </label>
            <textarea
              value={formData.side_effects}
              onChange={(e) => setFormData({ ...formData, side_effects: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={2}
              placeholder="List any known side effects"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Additional notes or instructions"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'discontinued' | 'completed' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
              <option value="completed">Completed</option>
            </select>
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
              onClick={handleSaveMedication}
            >
              Save Medication
            </Button>
          </div>
        </div>
      </Modal>

      {/* Medication Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedMedication ? selectedMedication.name : 'Medication Details'}
        maxWidth="xl"
      >
        {selectedMedication && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Pill className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMedication.name}</h3>
                  <p className="text-purple-600">{selectedMedication.dosage}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMedication.status)}`}>
                  {selectedMedication.status.charAt(0).toUpperCase() + selectedMedication.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Dosage Schedule</h4>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Clock size={18} className="text-purple-500" />
                      <span className="font-medium">{getFrequencyLabel(selectedMedication.frequency)}</span>
                    </div>
                  </div>

                  {selectedMedication.start_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Start Date</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={18} className="text-purple-500" />
                        <span>{new Date(selectedMedication.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {selectedMedication.end_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">End Date</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={18} className="text-purple-500" />
                        <span>{new Date(selectedMedication.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {selectedMedication.refills_remaining !== null && selectedMedication.refills_remaining !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Refills</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <RefreshCw size={18} className="text-purple-500" />
                        <span>{selectedMedication.refills_remaining} remaining</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedMedication.prescribing_provider && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Prescribed By</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Stethoscope size={18} className="text-purple-500" />
                        <span>{selectedMedication.prescribing_provider}</span>
                      </div>
                    </div>
                  )}

                  {selectedMedication.pharmacy && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Pharmacy</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Building size={18} className="text-purple-500" />
                        <span>{selectedMedication.pharmacy}</span>
                      </div>
                    </div>
                  )}

                  {selectedMedication.next_refill_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Next Refill</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={18} className="text-purple-500" />
                        <span>{new Date(selectedMedication.next_refill_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedMedication.side_effects && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Side Effects</h4>
                  <div className="bg-red-50 p-3 rounded-lg text-red-800 text-sm">
                    {selectedMedication.side_effects}
                  </div>
                </div>
              )}

              {selectedMedication.notes && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-gray-700">
                    {selectedMedication.notes}
                  </div>
                </div>
              )}
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
                  handleDeleteMedication(selectedMedication.id);
                }}
              >
                Delete Medication
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

// Helper Building component for this file only
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
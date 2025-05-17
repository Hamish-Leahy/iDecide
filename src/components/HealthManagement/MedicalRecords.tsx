import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, AlertCircle, Search, Filter, Stethoscope, Calendar, ClipboardList, Thermometer, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { motion } from 'framer-motion';

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  provider_id?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  test_results?: any;
  notes?: string;
  attachments?: string[];
  provider?: {
    name: string;
    specialty: string;
  };
}

export function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const recordTypes = [
    { value: 'visit', label: 'Doctor Visit', icon: Stethoscope },
    { value: 'test', label: 'Medical Test', icon: ClipboardList },
    { value: 'procedure', label: 'Procedure', icon: Activity },
    { value: 'vaccination', label: 'Vaccination', icon: FileText },
    { value: 'diagnosis', label: 'Diagnosis', icon: Thermometer },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'visit',
    provider_id: '',
    diagnosis: '',
    treatment: '',
    medications: [''],
    test_results: {},
    notes: '',
    attachments: ['']
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [recordsResponse, providersResponse] = await Promise.all([
        supabase
          .from('medical_records')
          .select(`
            *,
            provider:provider_id (
              name,
              specialty
            )
          `)
          .eq('user_id', user?.id)
          .order('date', { ascending: false }),
        supabase
          .from('health_providers')
          .select('id, name, specialty')
          .eq('user_id', user?.id)
      ]);

      if (recordsResponse.error) throw recordsResponse.error;
      if (providersResponse.error) throw providersResponse.error;

      setRecords(recordsResponse.data || []);
      setProviders(providersResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .insert([{
          ...formData,
          user_id: user?.id,
          medications: formData.medications.filter(m => m),
          attachments: formData.attachments.filter(a => a)
        }])
        .select(`
          *,
          provider:provider_id (
            name,
            specialty
          )
        `)
        .single();

      if (error) throw error;

      setRecords(prev => [data, ...prev]);
      setShowAddModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'visit',
        provider_id: '',
        diagnosis: '',
        treatment: '',
        medications: [''],
        test_results: {},
        notes: '',
        attachments: ['']
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medical record');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(record => record.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medical record');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.treatment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.provider?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || record.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getRecordTypeIcon = (type: string) => {
    const recordType = recordTypes.find(t => t.value === type);
    const Icon = recordType?.icon || FileText;
    return <Icon size={20} />;
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-1">Track your medical history</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Record
        </Button>
      </div>

      {/* Filing Cabinet Design */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 border border-gray-300 shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Medical Filing Cabinet</h2>
            <p className="text-gray-600">Your complete medical history in one place</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4 shadow-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search medical records..."
            className="flex-1"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Record Types</option>
            {recordTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Records Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <motion.div
                key={record.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                onClick={() => handleViewRecord(record)}
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${
                        record.type === 'visit' ? 'bg-blue-100 text-blue-600' :
                        record.type === 'test' ? 'bg-purple-100 text-purple-600' :
                        record.type === 'procedure' ? 'bg-amber-100 text-amber-600' :
                        record.type === 'vaccination' ? 'bg-green-100 text-green-600' :
                        record.type === 'diagnosis' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getRecordTypeIcon(record.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {recordTypes.find(t => t.value === record.type)?.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecord(record.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {record.provider && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Stethoscope size={16} />
                      <span>{record.provider.name}</span>
                    </div>
                  )}
                  
                  {record.diagnosis && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Diagnosis:</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{record.diagnosis}</p>
                    </div>
                  )}

                  {record.treatment && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Treatment:</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{record.treatment}</p>
                    </div>
                  )}

                  {record.medications && record.medications.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Pill size={14} />
                      <span>{record.medications.length} medication(s)</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-right">
                  Click to view details
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? 'No records match your search criteria'
                  : 'You haven\'t added any medical records yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Record
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Medical Record"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {recordTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Healthcare Provider
            </label>
            <select
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter diagnosis"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe the treatment plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medications
            </label>
            {formData.medications.map((medication, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => {
                    const newMedications = [...formData.medications];
                    newMedications[index] = e.target.value;
                    setFormData({ ...formData, medications: newMedications });
                  }}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter medication name"
                />
                <button
                  onClick={() => {
                    const newMedications = formData.medications.filter((_, i) => i !== index);
                    setFormData({ ...formData, medications: newMedications });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setFormData({ 
                ...formData, 
                medications: [...formData.medications, ''] 
              })}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Medication
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes or observations"
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
              onClick={handleSaveRecord}
            >
              Save Record
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedRecord ? `${recordTypes.find(t => t.value === selectedRecord.type)?.label} - ${new Date(selectedRecord.date).toLocaleDateString()}` : 'Record Details'}
        maxWidth="xl"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${
                  selectedRecord.type === 'visit' ? 'bg-blue-100 text-blue-600' :
                  selectedRecord.type === 'test' ? 'bg-purple-100 text-purple-600' :
                  selectedRecord.type === 'procedure' ? 'bg-amber-100 text-amber-600' :
                  selectedRecord.type === 'vaccination' ? 'bg-green-100 text-green-600' :
                  selectedRecord.type === 'diagnosis' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getRecordTypeIcon(selectedRecord.type)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {recordTypes.find(t => t.value === selectedRecord.type)?.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedRecord.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedRecord.provider && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <Stethoscope size={16} />
                    <span className="font-medium">Healthcare Provider</span>
                  </div>
                  <p className="text-gray-700">{selectedRecord.provider.name}</p>
                  <p className="text-sm text-gray-500">{selectedRecord.provider.specialty}</p>
                </div>
              )}

              {selectedRecord.diagnosis && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Diagnosis</h4>
                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                    {selectedRecord.diagnosis}
                  </p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Treatment</h4>
                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                    {selectedRecord.treatment}
                  </p>
                </div>
              )}

              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Medications</h4>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <ul className="list-disc list-inside space-y-1">
                      {selectedRecord.medications.map((med, index) => (
                        <li key={index} className="text-gray-900">{med}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                    {selectedRecord.notes}
                  </p>
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
                  handleDeleteRecord(selectedRecord.id);
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
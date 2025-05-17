import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, AlertCircle, Plus, FileText, X, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TrustBuilder } from './TrustBuilder';

interface WillDocument {
  id: string;
  title: string;
  type: 'will' | 'trust';
  status: string;
  content: string;
  last_reviewed: string;
}

interface WillFormData {
  testator: {
    name: string;
    address: string;
    maritalStatus: string;
  };
  executor: {
    name: string;
    address: string;
    relationship: string;
  };
  alternateExecutor: {
    name: string;
    address: string;
    relationship: string;
  };
  beneficiaries: Array<{
    name: string;
    relationship: string;
    share: string;
    specificGifts?: string;
  }>;
  guardians?: Array<{
    name: string;
    relationship: string;
  }>;
  specificBequests: Array<{
    item: string;
    recipient: string;
    description: string;
  }>;
  residualEstate: {
    distribution: string;
    charities?: Array<{
      name: string;
      percentage: number;
    }>;
  };
  finalWishes: {
    funeral: string;
    burial: string;
    organDonation: string;
  };
}

const initialFormData: WillFormData = {
  testator: {
    name: '',
    address: '',
    maritalStatus: '',
  },
  executor: {
    name: '',
    address: '',
    relationship: '',
  },
  alternateExecutor: {
    name: '',
    address: '',
    relationship: '',
  },
  beneficiaries: [{
    name: '',
    relationship: '',
    share: '',
  }],
  guardians: [],
  specificBequests: [],
  residualEstate: {
    distribution: 'equal',
    charities: [],
  },
  finalWishes: {
    funeral: '',
    burial: '',
    organDonation: '',
  },
};

export function WillsAndTrusts() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<WillDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWillBuilder, setShowWillBuilder] = useState(false);
  const [showTrustBuilder, setShowTrustBuilder] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WillFormData>(initialFormData);
  const [uploadType, setUploadType] = useState<'will' | 'trust'>('will');

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('user_id', user?.id)
        .in('type', ['will', 'trust']);

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (section: keyof WillFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .insert([
          {
            user_id: user?.id,
            title: `Last Will and Testament - ${formData.testator.name}`,
            type: 'will',
            status: 'draft',
            content: JSON.stringify(formData),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [...prev, data]);
      setShowWillBuilder(false);
      setFormData(initialFormData);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save will');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from('legal_documents')
        .upload(`${user?.id}/${uploadType}s/${file.name}`, file);

      if (error) throw error;

      // Create document record
      await supabase.from('legal_documents').insert([
        {
          user_id: user?.id,
          title: `Uploaded ${uploadType === 'will' ? 'Will' : 'Trust'} - ${file.name}`,
          type: uploadType,
          status: 'active',
          content: JSON.stringify({ file_path: data.path }),
        },
      ]);

      setShowUploadModal(false);
      loadDocuments(); // Reload documents to show the newly uploaded one
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    }
  };

  const steps = [
    {
      title: 'Personal Information',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Your Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={formData.testator.name}
                onChange={(e) => handleInputChange('testator', 'name', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Address
              </label>
              <textarea
                value={formData.testator.address}
                onChange={(e) => handleInputChange('testator', 'address', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                value={formData.testator.maritalStatus}
                onChange={(e) => handleInputChange('testator', 'maritalStatus', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Executor Details',
      component: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Primary Executor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.executor.name}
                  onChange={(e) => handleInputChange('executor', 'name', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.executor.address}
                  onChange={(e) => handleInputChange('executor', 'address', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship to You
                </label>
                <input
                  type="text"
                  value={formData.executor.relationship}
                  onChange={(e) => handleInputChange('executor', 'relationship', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Alternate Executor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.alternateExecutor.name}
                  onChange={(e) => handleInputChange('alternateExecutor', 'name', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.alternateExecutor.address}
                  onChange={(e) => handleInputChange('alternateExecutor', 'address', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship to You
                </label>
                <input
                  type="text"
                  value={formData.alternateExecutor.relationship}
                  onChange={(e) => handleInputChange('alternateExecutor', 'relationship', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Beneficiaries',
      component: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Beneficiaries</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  beneficiaries: [
                    ...prev.beneficiaries,
                    { name: '', relationship: '', share: '' }
                  ]
                }));
              }}
              icon={<Plus size={16} />}
            >
              Add Beneficiary
            </Button>
          </div>

          <div className="space-y-6">
            {formData.beneficiaries.map((beneficiary, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => {
                    const newBeneficiaries = [...formData.beneficiaries];
                    newBeneficiaries.splice(index, 1);
                    setFormData({ ...formData, beneficiaries: newBeneficiaries });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  disabled={formData.beneficiaries.length <= 1}
                >
                  <X size={16} />
                </button>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={beneficiary.name}
                      onChange={(e) => {
                        const newBeneficiaries = [...formData.beneficiaries];
                        newBeneficiaries[index].name = e.target.value;
                        setFormData({ ...formData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={beneficiary.relationship}
                      onChange={(e) => {
                        const newBeneficiaries = [...formData.beneficiaries];
                        newBeneficiaries[index].relationship = e.target.value;
                        setFormData({ ...formData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Share of Estate
                    </label>
                    <input
                      type="text"
                      value={beneficiary.share}
                      onChange={(e) => {
                        const newBeneficiaries = [...formData.beneficiaries];
                        newBeneficiaries[index].share = e.target.value;
                        setFormData({ ...formData, beneficiaries: newBeneficiaries });
                      }}
                      placeholder="e.g., 25% or specific amount"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Specific Bequests',
      component: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Specific Bequests</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  specificBequests: [
                    ...prev.specificBequests,
                    { item: '', recipient: '', description: '' }
                  ]
                }));
              }}
              icon={<Plus size={16} />}
            >
              Add Bequest
            </Button>
          </div>

          <div className="space-y-6">
            {formData.specificBequests.map((bequest, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => {
                    const newBequests = [...formData.specificBequests];
                    newBequests.splice(index, 1);
                    setFormData({ ...formData, specificBequests: newBequests });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item or Asset
                    </label>
                    <input
                      type="text"
                      value={bequest.item}
                      onChange={(e) => {
                        const newBequests = [...formData.specificBequests];
                        newBequests[index].item = e.target.value;
                        setFormData({ ...formData, specificBequests: newBequests });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient
                    </label>
                    <input
                      type="text"
                      value={bequest.recipient}
                      onChange={(e) => {
                        const newBequests = [...formData.specificBequests];
                        newBequests[index].recipient = e.target.value;
                        setFormData({ ...formData, specificBequests: newBequests });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={bequest.description}
                      onChange={(e) => {
                        const newBequests = [...formData.specificBequests];
                        newBequests[index].description = e.target.value;
                        setFormData({ ...formData, specificBequests: newBequests });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Final Wishes',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Final Wishes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funeral Arrangements
              </label>
              <textarea
                value={formData.finalWishes.funeral}
                onChange={(e) => handleInputChange('finalWishes', 'funeral', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your preferred funeral arrangements..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Burial Instructions
              </label>
              <textarea
                value={formData.finalWishes.burial}
                onChange={(e) => handleInputChange('finalWishes', 'burial', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Specify your burial or cremation preferences..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organ Donation
              </label>
              <select
                value={formData.finalWishes.organDonation}
                onChange={(e) => handleInputChange('finalWishes', 'organDonation', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select preference</option>
                <option value="yes">Yes, I wish to donate my organs</option>
                <option value="no">No, I do not wish to donate my organs</option>
                <option value="specific">I wish to donate specific organs only</option>
              </select>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wills & Trusts</h1>
          <p className="text-gray-600 mt-1">Manage your will and trust documents</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Upload Existing Will Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Existing Documents</h2>
          <p className="text-gray-600 mb-4">
            If you already have a will or trust document, you can upload it here for safekeeping.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => {
                setUploadType('will');
                setShowUploadModal(true);
              }}
            >
              <Upload size={20} className="mr-2" />
              Upload Existing Will
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => {
                setUploadType('trust');
                setShowUploadModal(true);
              }}
            >
              <Upload size={20} className="mr-2" />
              Upload Existing Trust
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Last Will and Testament</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                A will is a legal document that outlines your wishes for the distribution of your assets after your death.
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => setShowWillBuilder(true)}
              >
                <ScrollText size={20} className="mr-2" />
                Create Will
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Living Trust</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                A living trust helps avoid probate and allows for smoother transfer of assets to beneficiaries.
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => setShowTrustBuilder(true)}
              >
                <FileText size={20} className="mr-2" />
                Create Trust
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
          <div className="space-y-4">
            {documents.map(doc => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-600" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      Last reviewed: {new Date(doc.last_reviewed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </motion.div>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No documents created yet
              </div>
            )}
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showWillBuilder}
        onClose={() => setShowWillBuilder(false)}
        title="Create Your Will"
        maxWidth="2xl"
      >
        <div className="space-y-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep].title}
          </h2>

          <div className="mt-4">
            {steps[currentStep].component}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowWillBuilder(false)}
              >
                Cancel
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleSave}
                >
                  Save Will
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <TrustBuilder 
        isOpen={showTrustBuilder} 
        onClose={() => setShowTrustBuilder(false)} 
      />

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title={`Upload ${uploadType === 'will' ? 'Will' : 'Trust'} Document`}
      >
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload size={40} className="text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, or DOCX (max. 10MB)
              </p>
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
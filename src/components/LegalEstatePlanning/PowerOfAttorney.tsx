import React, { useState } from 'react';
import { UserCog, AlertCircle, Upload, X, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface POAFormData {
  type: 'financial' | 'medical';
  principal: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  agent: {
    name: string;
    address: string;
    phone: string;
    email: string;
    relationship: string;
  };
  alternateAgent: {
    name: string;
    address: string;
    phone: string;
    email: string;
    relationship: string;
  };
  powers: string[];
  effectiveDate: string;
  durability: boolean;
  limitations: string;
  revocation: string;
}

const initialFormData: POAFormData = {
  type: 'financial',
  principal: {
    name: '',
    address: '',
    phone: '',
    email: '',
  },
  agent: {
    name: '',
    address: '',
    phone: '',
    email: '',
    relationship: '',
  },
  alternateAgent: {
    name: '',
    address: '',
    phone: '',
    email: '',
    relationship: '',
  },
  powers: [],
  effectiveDate: '',
  durability: true,
  limitations: '',
  revocation: '',
};

const financialPowers = [
  'Real estate transactions',
  'Banking and financial transactions',
  'Business operations',
  'Insurance transactions',
  'Tax matters',
  'Investment decisions',
  'Retirement benefit transactions',
  'Legal claims and litigation',
  'Personal property transactions',
  'Government benefits',
];

const medicalPowers = [
  'Medical treatment decisions',
  'Hospital/facility admission',
  'Medication decisions',
  'Surgical procedures',
  'End-of-life decisions',
  'Access to medical records',
  'Choice of healthcare providers',
  'Organ/tissue donation',
  'Mental health treatment',
  'Pain management decisions',
];

export function PowerOfAttorney() {
  const { user } = useAuth();
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState<POAFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'financial' | 'medical'>('financial');

  const handleInputChange = (section: keyof POAFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handlePowerToggle = (power: string) => {
    setFormData(prev => ({
      ...prev,
      powers: prev.powers.includes(power)
        ? prev.powers.filter(p => p !== power)
        : [...prev.powers, power],
    }));
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .insert([
          {
            user_id: user?.id,
            title: `${formData.type === 'financial' ? 'Financial' : 'Medical'} Power of Attorney`,
            type: 'poa',
            status: 'draft',
            content: JSON.stringify(formData),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowFinancialModal(false);
      setShowMedicalModal(false);
      setFormData(initialFormData);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save power of attorney');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from('legal_documents')
        .upload(`${user?.id}/poa/${file.name}`, file);

      if (error) throw error;

      // Create document record
      await supabase.from('legal_documents').insert([
        {
          user_id: user?.id,
          title: `Uploaded ${uploadType === 'financial' ? 'Financial' : 'Medical'} POA - ${file.name}`,
          type: 'poa',
          status: 'active',
          content: JSON.stringify({ file_path: data.path }),
        },
      ]);

      setShowUploadModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    }
  };

  const steps = [
    {
      title: 'Principal Information',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Principal Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={formData.principal.name}
                onChange={(e) => handleInputChange('principal', 'name', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.principal.address}
                onChange={(e) => handleInputChange('principal', 'address', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.principal.phone}
                onChange={(e) => handleInputChange('principal', 'phone', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.principal.email}
                onChange={(e) => handleInputChange('principal', 'email', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Agent Information',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Primary Agent</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.agent.name}
                onChange={(e) => handleInputChange('agent', 'name', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.agent.address}
                onChange={(e) => handleInputChange('agent', 'address', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.agent.phone}
                onChange={(e) => handleInputChange('agent', 'phone', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.agent.email}
                onChange={(e) => handleInputChange('agent', 'email', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to Principal
              </label>
              <input
                type="text"
                value={formData.agent.relationship}
                onChange={(e) => handleInputChange('agent', 'relationship', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Powers',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Granted Powers</h3>
          <div className="space-y-4">
            {(formData.type === 'financial' ? financialPowers : medicalPowers).map(power => (
              <label key={power} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.powers.includes(power)}
                  onChange={() => handlePowerToggle(power)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{power}</span>
              </label>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Terms and Conditions',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date
            </label>
            <select
              value={formData.effectiveDate}
              onChange={(e) => handleInputChange('effectiveDate', '', e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select when this POA becomes effective</option>
              <option value="immediate">Immediately upon signing</option>
              <option value="incapacity">Upon incapacity (Springing POA)</option>
              <option value="date">On specific date</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.durability}
                onChange={(e) => handleInputChange('durability', '', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">
                Durable Power of Attorney (remains effective if principal becomes incapacitated)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limitations and Restrictions
            </label>
            <textarea
              value={formData.limitations}
              onChange={(e) => handleInputChange('limitations', '', e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Specify any limitations on the agent's powers..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Revocation Terms
            </label>
            <textarea
              value={formData.revocation}
              onChange={(e) => handleInputChange('revocation', '', e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Specify conditions under which this POA can be revoked..."
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Power of Attorney</h1>
          <p className="text-gray-600 mt-1">Set up and manage power of attorney documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Financial Power of Attorney</h2>
            <p className="text-gray-600 mb-4">
              Designate someone to manage your financial affairs if you become unable to do so.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setFormData({ ...initialFormData, type: 'financial' });
                  setShowFinancialModal(true);
                }}
              >
                <UserCog size={20} className="mr-2" />
                Create Financial POA
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setUploadType('financial');
                  setShowUploadModal(true);
                }}
              >
                <Upload size={20} className="mr-2" />
                Upload Existing POA
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Medical Power of Attorney</h2>
            <p className="text-gray-600 mb-4">
              Choose someone to make healthcare decisions on your behalf if necessary.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setFormData({ ...initialFormData, type: 'medical' });
                  setShowMedicalModal(true);
                }}
              >
                <UserCog size={20} className="mr-2" />
                Create Medical POA
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setUploadType('medical');
                  setShowUploadModal(true);
                }}
              >
                <Upload size={20} className="mr-2" />
                Upload Existing POA
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-start gap-3 text-amber-800 bg-amber-50 p-4 rounded-lg">
            <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium mb-2">Important Notice</h3>
              <p className="text-sm">
                Power of Attorney documents are crucial legal instruments that should be prepared with proper legal counsel. 
                We recommend consulting with a qualified attorney to ensure these documents meet your specific needs and comply with local laws.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* POA Builder Modal */}
      <Modal
        isOpen={showFinancialModal || showMedicalModal}
        onClose={() => {
          setShowFinancialModal(false);
          setShowMedicalModal(false);
          setCurrentStep(0);
        }}
        title={`Create ${formData.type === 'financial' ? 'Financial' : 'Medical'} Power of Attorney`}
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
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFinancialModal(false);
                  setShowMedicalModal(false);
                  setCurrentStep(0);
                }}
              >
                Cancel
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleSave}
                >
                  Save Document
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title={`Upload ${uploadType === 'financial' ? 'Financial' : 'Medical'} Power of Attorney`}
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
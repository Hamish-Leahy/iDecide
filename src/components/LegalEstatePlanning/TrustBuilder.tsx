import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface TrustFormData {
  trustDetails: {
    name: string;
    type: 'revocable' | 'irrevocable';
    purpose: string;
  };
  trustor: {
    name: string;
    address: string;
    maritalStatus: string;
  };
  trustees: Array<{
    name: string;
    address: string;
    relationship: string;
    type: 'primary' | 'successor';
  }>;
  beneficiaries: Array<{
    name: string;
    relationship: string;
    share: string;
    conditions?: string;
    distributionSchedule?: string;
  }>;
  assets: Array<{
    type: string;
    description: string;
    value: string;
    notes?: string;
  }>;
  distributions: {
    schedule: string;
    conditions: string;
    spendingProvisions?: string;
  };
  powerOfTrustee: {
    investmentPowers: boolean;
    distributionPowers: boolean;
    amendmentPowers: boolean;
    additionalPowers: string;
  };
}

const initialFormData: TrustFormData = {
  trustDetails: {
    name: '',
    type: 'revocable',
    purpose: '',
  },
  trustor: {
    name: '',
    address: '',
    maritalStatus: '',
  },
  trustees: [{
    name: '',
    address: '',
    relationship: '',
    type: 'primary',
  }],
  beneficiaries: [{
    name: '',
    relationship: '',
    share: '',
  }],
  assets: [{
    type: '',
    description: '',
    value: '',
  }],
  distributions: {
    schedule: '',
    conditions: '',
  },
  powerOfTrustee: {
    investmentPowers: false,
    distributionPowers: false,
    amendmentPowers: false,
    additionalPowers: '',
  },
};

export function TrustBuilder() {
  const { user } = useAuth();
  const [showTrustBuilder, setShowTrustBuilder] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TrustFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (section: keyof TrustFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAddTrustee = () => {
    setFormData(prev => ({
      ...prev,
      trustees: [
        ...prev.trustees,
        { name: '', address: '', relationship: '', type: 'successor' },
      ],
    }));
  };

  const handleRemoveTrustee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trustees: prev.trustees.filter((_, i) => i !== index),
    }));
  };

  const handleAddBeneficiary = () => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: [
        ...prev.beneficiaries,
        { name: '', relationship: '', share: '' },
      ],
    }));
  };

  const handleRemoveBeneficiary = (index: number) => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index),
    }));
  };

  const handleAddAsset = () => {
    setFormData(prev => ({
      ...prev,
      assets: [
        ...prev.assets,
        { type: '', description: '', value: '' },
      ],
    }));
  };

  const handleRemoveAsset = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index),
    }));
  };

  const steps = [
    {
      title: 'Trust Details',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Trust Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trust Name
              </label>
              <input
                type="text"
                value={formData.trustDetails.name}
                onChange={(e) => handleInputChange('trustDetails', 'name', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Smith Family Living Trust"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trust Type
              </label>
              <select
                value={formData.trustDetails.type}
                onChange={(e) => handleInputChange('trustDetails', 'type', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="revocable">Revocable Living Trust</option>
                <option value="irrevocable">Irrevocable Trust</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trust Purpose
              </label>
              <textarea
                value={formData.trustDetails.purpose}
                onChange={(e) => handleInputChange('trustDetails', 'purpose', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the primary purpose of this trust..."
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Trustor Information',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Trustor Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={formData.trustor.name}
                onChange={(e) => handleInputChange('trustor', 'name', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Address
              </label>
              <textarea
                value={formData.trustor.address}
                onChange={(e) => handleInputChange('trustor', 'address', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                value={formData.trustor.maritalStatus}
                onChange={(e) => handleInputChange('trustor', 'maritalStatus', e.target.value)}
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
      title: 'Trustees',
      component: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trustees</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTrustee}
              icon={<Plus size={16} />}
            >
              Add Trustee
            </Button>
          </div>

          <div className="space-y-6">
            {formData.trustees.map((trustee, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => handleRemoveTrustee(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trustee Type
                    </label>
                    <select
                      value={trustee.type}
                      onChange={(e) => {
                        const newTrustees = [...formData.trustees];
                        newTrustees[index].type = e.target.value as 'primary' | 'successor';
                        setFormData({ ...formData, trustees: newTrustees });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="primary">Primary Trustee</option>
                      <option value="successor">Successor Trustee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={trustee.name}
                      onChange={(e) => {
                        const newTrustees = [...formData.trustees];
                        newTrustees[index].name = e.target.value;
                        setFormData({ ...formData, trustees: newTrustees });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={trustee.address}
                      onChange={(e) => {
                        const newTrustees = [...formData.trustees];
                        newTrustees[index].address = e.target.value;
                        setFormData({ ...formData, trustees: newTrustees });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship to Trustor
                    </label>
                    <input
                      type="text"
                      value={trustee.relationship}
                      onChange={(e) => {
                        const newTrustees = [...formData.trustees];
                        newTrustees[index].relationship = e.target.value;
                        setFormData({ ...formData, trustees: newTrustees });
                      }}
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
      title: 'Trust Assets',
      component: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trust Assets</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAsset}
              icon={<Plus size={16} />}
            >
              Add Asset
            </Button>
          </div>

          <div className="space-y-6">
            {formData.assets.map((asset, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => handleRemoveAsset(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Type
                    </label>
                    <select
                      value={asset.type}
                      onChange={(e) => {
                        const newAssets = [...formData.assets];
                        newAssets[index].type = e.target.value;
                        setFormData({ ...formData, assets: newAssets });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="bank_account">Bank Account</option>
                      <option value="investment">Investment Account</option>
                      <option value="business">Business Interest</option>
                      <option value="personal_property">Personal Property</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={asset.description}
                      onChange={(e) => {
                        const newAssets = [...formData.assets];
                        newAssets[index].description = e.target.value;
                        setFormData({ ...formData, assets: newAssets });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Provide detailed description of the asset..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approximate Value
                    </label>
                    <input
                      type="text"
                      value={asset.value}
                      onChange={(e) => {
                        const newAssets = [...formData.assets];
                        newAssets[index].value = e.target.value;
                        setFormData({ ...formData, assets: newAssets });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., $500,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={asset.notes}
                      onChange={(e) => {
                        const newAssets = [...formData.assets];
                        newAssets[index].notes = e.target.value;
                        setFormData({ ...formData, assets: newAssets });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Any special instructions or notes about this asset..."
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
      title: 'Beneficiaries',
      component: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Beneficiaries</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddBeneficiary}
              icon={<Plus size={16} />}
            >
              Add Beneficiary
            </Button>
          </div>

          <div className="space-y-6">
            {formData.beneficiaries.map((beneficiary, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => handleRemoveBeneficiary(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
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
                      Share of Trust
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distribution Schedule
                    </label>
                    <textarea
                      value={beneficiary.distributionSchedule}
                      onChange={(e) => {
                        const newBeneficiaries = [...formData.beneficiaries];
                        newBeneficiaries[index].distributionSchedule = e.target.value;
                        setFormData({ ...formData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Specify when and how the beneficiary should receive their share..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conditions
                    </label>
                    <textarea
                      value={beneficiary.conditions}
                      onChange={(e) => {
                        const newBeneficiaries = [...formData.beneficiaries];
                        newBeneficiaries[index].conditions = e.target.value;
                        setFormData({ ...formData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Any conditions that must be met (e.g., age, education)..."
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
      title: 'Distribution Terms',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Distribution Terms</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution Schedule
              </label>
              <textarea
                value={formData.distributions.schedule}
                onChange={(e) => handleInputChange('distributions', 'schedule', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Specify the overall schedule for trust distributions..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution Conditions
              </label>
              <textarea
                value={formData.distributions.conditions}
                onChange={(e) => handleInputChange('distributions', 'conditions', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Specify any conditions that must be met for distributions..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spending Provisions
              </label>
              <textarea
                value={formData.distributions.spendingProvisions}
                onChange={(e) => handleInputChange('distributions', 'spendingProvisions', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Specify any restrictions or guidelines for how trust funds can be spent..."
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Trustee Powers',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Trustee Powers</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.powerOfTrustee.investmentPowers}
                  onChange={(e) => handleInputChange('powerOfTrustee', 'investmentPowers', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Investment Powers</span>
              </label>
              <p className="text-sm text-gray-500 ml-6">
                Authority to make investment decisions for trust assets
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.powerOfTrustee.distributionPowers}
                  onChange={(e) => handleInputChange('powerOfTrustee', 'distributionPowers', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Distribution Powers</span>
              </label>
              <p className="text-sm text-gray-500 ml-6">
                Authority to make distributions according to trust terms
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.powerOfTrustee.amendmentPowers}
                  onChange={(e) => handleInputChange('powerOfTrustee', 'amendmentPowers', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Amendment Powers</span>
              </label>
              <p className="text-sm text-gray-500 ml-6">
                Authority to amend trust terms (typically for revocable trusts only)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Powers
              </label>
              <textarea
                value={formData.powerOfTrustee.additionalPowers}
                onChange={(e) => handleInputChange('powerOfTrustee', 'additionalPowers', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Specify any additional powers granted to the trustee..."
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

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
            title: formData.trustDetails.name,
            type: 'trust',
            status: 'draft',
            content: JSON.stringify(formData),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowTrustBuilder(false);
      setFormData(initialFormData);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trust');
    }
  };

  return (
    <Modal
      isOpen={showTrustBuilder}
      onClose={() => setShowTrustBuilder(false)}
      title="Create Living Trust"
      maxWidth="2xl"
    >
      <div className="space-y-8">
        {/* Progress bar */}
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

        {/* Step title */}
        <h2 className="text-xl font-semibold text-gray-900">
          {steps[currentStep].title}
        </h2>

        {/* Step content */}
        <div className="mt-4">
          {steps[currentStep].component}
        </div>

        {/* Navigation buttons */}
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
              onClick={() => setShowTrustBuilder(false)}
            >
              Cancel
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSave}
              >
                Save Trust
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

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
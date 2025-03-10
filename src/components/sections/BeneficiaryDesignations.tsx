import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Percent, Clock, FileText, AlertTriangle, Upload, Download } from 'lucide-react';
import { useBeneficiaryStore, Asset, Beneficiary } from '../../store/beneficiaryStore';

interface Beneficiary {
  id: string;
  type: 'primary' | 'contingent';
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  address: string;
  percentage: number;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  value: string;
  beneficiaries: Beneficiary[];
}

const BeneficiaryForm = ({
  beneficiary,
  onSave,
  onCancel,
}: {
  beneficiary?: Beneficiary;
  onSave: (data: Omit<Beneficiary, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Omit<Beneficiary, 'id'>>({
    type: beneficiary?.type || 'primary',
    fullName: beneficiary?.fullName || '',
    relationship: beneficiary?.relationship || '',
    dateOfBirth: beneficiary?.dateOfBirth || '',
    ssn: beneficiary?.ssn || '',
    email: beneficiary?.email || '',
    phone: beneficiary?.phone || '',
    address: beneficiary?.address || '',
    percentage: beneficiary?.percentage || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) newErrors.fullName = 'Name is required';
    if (!formData.relationship) newErrors.relationship = 'Relationship is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.ssn) newErrors.ssn = 'SSN is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = 'Percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beneficiary Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'primary' | 'contingent' })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="primary">Primary</option>
            <option value="contingent">Contingent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Legal Name
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relationship
          </label>
          <input
            type="text"
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Social Security Number
          </label>
          <input
            type="password"
            value={formData.ssn}
            onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.ssn && <p className="text-red-500 text-sm mt-1">{errors.ssn}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Percentage Allocation
          </label>
          <input
            type="number"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
            className="w-full p-2 border rounded-lg"
            min="0"
            max="100"
          />
          {errors.percentage && <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
        >
          Save Beneficiary
        </button>
      </div>
    </form>
  );
};

const BeneficiaryCard = ({
  beneficiary,
  onEdit,
  onDelete,
}: {
  beneficiary: Beneficiary;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-[#B5D3D3] p-4 rounded-lg">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="text-lg font-medium">{beneficiary.fullName}</h4>
        <p className="text-sm text-gray-600">{beneficiary.relationship}</p>
      </div>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2D5959] text-white">
        {beneficiary.percentage}%
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-600">Email:</p>
        <p>{beneficiary.email}</p>
      </div>
      <div>
        <p className="text-gray-600">Phone:</p>
        <p>{beneficiary.phone}</p>
      </div>
    </div>

    <div className="flex justify-end gap-2 mt-4">
      <button
        onClick={onEdit}
        className="px-3 py-1 text-sm bg-[#2D5959] text-white rounded hover:bg-opacity-90"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
      >
        Remove
      </button>
    </div>
  </div>
);

const BeneficiaryDesignations = () => {
  const {
    assets,
    addAsset,
    updateAsset,
    addBeneficiary,
    updateBeneficiary,
    removeBeneficiary,
    validateBeneficiaryPercentages,
    getChangeHistory
  } = useBeneficiaryStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAsset) {
      const isValid = validateBeneficiaryPercentages(selectedAsset.id);
      if (!isValid) {
        setValidationError('Total percentage for primary beneficiaries must equal 100%');
      } else {
        setValidationError(null);
      }
    }
  }, [selectedAsset, validateBeneficiaryPercentages]);

  const handleSaveBeneficiary = (data: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedAsset) {
      const beneficiaryId = addBeneficiary(selectedAsset.id, data);
      
      // Validate percentages after adding
      if (!validateBeneficiaryPercentages(selectedAsset.id)) {
        setValidationError('Total percentage for primary beneficiaries must equal 100%');
      } else {
        setValidationError(null);
      }
      
      setShowForm(false);
    }
  };

  const handleEditBeneficiary = (beneficiaryId: string, updates: Partial<Beneficiary>) => {
    if (selectedAsset) {
      updateBeneficiary(selectedAsset.id, beneficiaryId, updates);
      
      // Validate percentages after updating
      if (!validateBeneficiaryPercentages(selectedAsset.id)) {
        setValidationError('Total percentage for primary beneficiaries must equal 100%');
      } else {
        setValidationError(null);
      }
    }
  };

  const handleDeleteBeneficiary = (beneficiaryId: string) => {
    if (selectedAsset) {
      removeBeneficiary(selectedAsset.id, beneficiaryId);
      
      // Validate percentages after removing
      if (!validateBeneficiaryPercentages(selectedAsset.id)) {
        setValidationError('Total percentage for primary beneficiaries must equal 100%');
      } else {
        setValidationError(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Beneficiary Designations</h2>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Asset Selection */}
      <div className="grid grid-cols-3 gap-6">
        {assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className={`p-6 rounded-lg text-left transition-colors ${
              selectedAsset?.id === asset.id ? 'bg-[#85B1B1]' : 'bg-[#B5D3D3]'
            }`}
          >
            <h3 className="text-lg font-medium mb-2">{asset.name}</h3>
            <p className="text-sm text-gray-600 mb-1">Type: {asset.type}</p>
            <p className="text-sm text-gray-600">Value: {asset.value}</p>
          </button>
        ))}
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {validationError}
        </div>
      )}

      {selectedAsset && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Beneficiaries for {selectedAsset.name}
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
              Add Beneficiary
            </button>
          </div>

          {showForm && (
            <BeneficiaryForm
              onSave={handleSaveBeneficiary}
              onCancel={() => setShowForm(false)}
            />
          )}

          <div className="grid grid-cols-2 gap-6">
            {selectedAsset.beneficiaries.map((beneficiary) => (
              <BeneficiaryCard
                key={beneficiary.id}
                beneficiary={beneficiary}
                onEdit={() => console.log('Edit', beneficiary.id)}
                onDelete={() => console.log('Delete', beneficiary.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BeneficiaryDesignations;
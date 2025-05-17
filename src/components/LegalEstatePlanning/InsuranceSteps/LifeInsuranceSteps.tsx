import React from 'react';

interface LifeInsuranceFormData {
  provider: string;
  policy_number: string;
  coverage_amount: string;
  premium: string;
  payment_frequency: string;
  start_date: string;
  renewal_date: string;
  beneficiaries: string[];
  notes: string;
}

interface LifeInsuranceStepsProps {
  formData: LifeInsuranceFormData;
  onChange: (data: Partial<LifeInsuranceFormData>) => void;
}

export function getLifeInsuranceSteps({ formData, onChange }: LifeInsuranceStepsProps) {
  return [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of your life insurance policy',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => onChange({ provider: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Number
            </label>
            <input
              type="text"
              value={formData.policy_number}
              onChange={(e) => onChange({ policy_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Coverage Details',
      description: 'Specify the coverage amount and premium details',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Amount
            </label>
            <input
              type="text"
              value={formData.coverage_amount}
              onChange={(e) => onChange({ coverage_amount: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $500,000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium Amount
              </label>
              <input
                type="text"
                value={formData.premium}
                onChange={(e) => onChange({ premium: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Frequency
              </label>
              <select
                value={formData.payment_frequency}
                onChange={(e) => onChange({ payment_frequency: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Policy Dates',
      description: 'Enter the start and renewal dates for your policy',
      component: (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => onChange({ start_date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Renewal Date
            </label>
            <input
              type="date"
              value={formData.renewal_date}
              onChange={(e) => onChange({ renewal_date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Beneficiaries',
      description: 'Add beneficiaries for your life insurance policy',
      component: (
        <div className="space-y-4">
          {formData.beneficiaries.map((beneficiary, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => {
                  const newBeneficiaries = [...formData.beneficiaries];
                  newBeneficiaries[index] = e.target.value;
                  onChange({ beneficiaries: newBeneficiaries });
                }}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
              />
              <button
                onClick={() => {
                  const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
                  onChange({ beneficiaries: newBeneficiaries });
                }}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ 
              beneficiaries: [...formData.beneficiaries, ''] 
            })}
            className="text-blue-600 hover:text-blue-700"
          >
            Add Beneficiary
          </button>
        </div>
      )
    },
    {
      title: 'Additional Information',
      description: 'Add any additional notes or information about the policy',
      component: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter any additional information about the policy..."
          />
        </div>
      )
    }
  ];
}
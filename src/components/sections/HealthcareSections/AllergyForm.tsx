import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AllergyFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

const AllergyForm: React.FC<AllergyFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    allergen: initialData?.allergen || '',
    reaction: initialData?.reaction || '',
    severity: initialData?.severity || 'mild',
    diagnosisDate: initialData?.diagnosisDate || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">
            {initialData ? 'Edit Allergy' : 'Add Allergy'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergen
              </label>
              <input
                type="text"
                value={formData.allergen}
                onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reaction
              </label>
              <textarea
                value={formData.reaction}
                onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Date
              </label>
              <input
                type="date"
                value={formData.diagnosisDate}
                onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
            >
              {initialData ? 'Save Changes' : 'Add Allergy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllergyForm;
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface MedicationFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    dosage: initialData?.dosage || '',
    frequency: initialData?.frequency || '',
    prescribingPhysicianId: initialData?.prescribingPhysicianId || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    purpose: initialData?.purpose || '',
    sideEffects: initialData?.sideEffects || '',
    isCurrent: initialData?.isCurrent ?? true,
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
            {initialData ? 'Edit Medication' : 'Add Medication'}
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
                Medication Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
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
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <input
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Side Effects
              </label>
              <textarea
                value={formData.sideEffects}
                onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="rounded border-gray-300 text-[#2D5959] focus:ring-[#2D5959]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Currently taking this medication
                </span>
              </label>
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
              {initialData ? 'Save Changes' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicationForm;
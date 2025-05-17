import React, { useState } from 'react';
import { FileText, AlertCircle, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface DirectiveFormData {
  type: 'living_will' | 'healthcare_directive';
  principal: {
    name: string;
    address: string;
    phone: string;
    birthdate: string;
  };
  agent?: {
    name: string;
    address: string;
    phone: string;
    relationship: string;
  };
  alternateAgent?: {
    name: string;
    address: string;
    phone: string;
    relationship: string;
  };
  medicalPreferences: {
    lifeSustaining: string;
    artificialNutrition: string;
    painManagement: string;
    organDonation: string;
    otherInstructions: string;
  };
  terminalConditions: {
    preferences: string[];
    specificInstructions: string;
  };
  mentalHealth: {
    preferences: string;
    medications: string;
    treatments: string;
  };
  additionalInstructions: string;
}

const initialFormData: DirectiveFormData = {
  type: 'living_will',
  principal: {
    name: '',
    address: '',
    phone: '',
    birthdate: '',
  },
  medicalPreferences: {
    lifeSustaining: '',
    artificialNutrition: '',
    painManagement: '',
    organDonation: '',
    otherInstructions: '',
  },
  terminalConditions: {
    preferences: [],
    specificInstructions: '',
  },
  mentalHealth: {
    preferences: '',
    medications: '',
    treatments: '',
  },
  additionalInstructions: '',
};

const lifeSustainingOptions = [
  { value: 'all', label: 'Use all available life-sustaining treatments' },
  { value: 'limited', label: 'Use life-sustaining treatments with limitations' },
  { value: 'comfort', label: 'Provide comfort care only' },
  { value: 'none', label: 'Do not use life-sustaining treatments' },
];

const artificialNutritionOptions = [
  { value: 'yes', label: 'Yes, I want artificial nutrition and hydration' },
  { value: 'trial', label: 'Yes, but only for a trial period' },
  { value: 'no', label: 'No, I do not want artificial nutrition and hydration' },
];

const organDonationOptions = [
  { value: 'all', label: 'I want to donate all organs and tissues' },
  { value: 'specific', label: 'I want to donate specific organs/tissues' },
  { value: 'research', label: 'I want to donate for research only' },
  { value: 'none', label: 'I do not want to donate organs or tissues' },
];

export function AdvanceDirectives() {
  const { user } = useAuth();
  const [showLivingWillModal, setShowLivingWillModal] = useState(false);
  const [showHealthcareDirectiveModal, setShowHealthcareDirectiveModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState<DirectiveFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'living_will' | 'healthcare_directive'>('living_will');

  const handleInputChange = (section: keyof DirectiveFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .insert([
          {
            user_id: user?.id,
            title: `${formData.type === 'living_will' ? 'Living Will' : 'Healthcare Directive'}`,
            type: formData.type,
            status: 'draft',
            content: JSON.stringify(formData),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowLivingWillModal(false);
      setShowHealthcareDirectiveModal(false);
      setFormData(initialFormData);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from('legal_documents')
        .upload(`${user?.id}/directives/${file.name}`, file);

      if (error) throw error;

      await supabase.from('legal_documents').insert([
        {
          user_id: user?.id,
          title: `Uploaded ${uploadType === 'living_will' ? 'Living Will' : 'Healthcare Directive'} - ${file.name}`,
          type: uploadType,
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
                value={formData.principal.name}
                onChange={(e) => handleInputChange('principal', 'name', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.principal.address}
                onChange={(e) => handleInputChange('principal', 'address', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.principal.birthdate}
                onChange={(e) => handleInputChange('principal', 'birthdate', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Medical Preferences',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Medical Care Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Life-Sustaining Treatment
              </label>
              <select
                value={formData.medicalPreferences.lifeSustaining}
                onChange={(e) => handleInputChange('medicalPreferences', 'lifeSustaining', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              >
                <option value="">Select preference</option>
                {lifeSustainingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artificial Nutrition and Hydration
              </label>
              <select
                value={formData.medicalPreferences.artificialNutrition}
                onChange={(e) => handleInputChange('medicalPreferences', 'artificialNutrition', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              >
                <option value="">Select preference</option>
                {artificialNutritionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pain Management Preferences
              </label>
              <textarea
                value={formData.medicalPreferences.painManagement}
                onChange={(e) => handleInputChange('medicalPreferences', 'painManagement', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
                rows={3}
                placeholder="Specify your preferences for pain management..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organ Donation
              </label>
              <select
                value={formData.medicalPreferences.organDonation}
                onChange={(e) => handleInputChange('medicalPreferences', 'organDonation', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              >
                <option value="">Select preference</option>
                {organDonationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Terminal Conditions',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Terminal Condition Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Preferences
              </label>
              <div className="space-y-2">
                {[
                  'Cardiopulmonary resuscitation (CPR)',
                  'Mechanical ventilation',
                  'Tube feeding',
                  'Dialysis',
                  'Antibiotics',
                  'Comfort care only',
                ].map(preference => (
                  <label key={preference} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.terminalConditions.preferences.includes(preference)}
                      onChange={(e) => {
                        const newPreferences = e.target.checked
                          ? [...formData.terminalConditions.preferences, preference]
                          : formData.terminalConditions.preferences.filter(p => p !== preference);
                        setFormData(prev => ({
                          ...prev,
                          terminalConditions: {
                            ...prev.terminalConditions,
                            preferences: newPreferences,
                          },
                        }));
                      }}
                      className="rounded text-idecide-accent focus:ring-idecide-accent"
                    />
                    <span className="text-gray-700">{preference}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Instructions
              </label>
              <textarea
                value={formData.terminalConditions.specificInstructions}
                onChange={(e) => handleInputChange('terminalConditions', 'specificInstructions', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
                rows={4}
                placeholder="Provide specific instructions for terminal conditions..."
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mental Health Care',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Mental Health Care Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                General Preferences
              </label>
              <textarea
                value={formData.mentalHealth.preferences}
                onChange={(e) => handleInputChange('mentalHealth', 'preferences', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
                rows={3}
                placeholder="Specify your general preferences for mental health care..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medication Preferences
              </label>
              <textarea
                value={formData.mentalHealth.medications}
                onChange={(e) => handleInputChange('mentalHealth', 'medications', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
                rows={3}
                placeholder="Specify preferences regarding psychiatric medications..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Preferences
              </label>
              <textarea
                value={formData.mentalHealth.treatments}
                onChange={(e) => handleInputChange('mentalHealth', 'treatments', e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
                rows={3}
                placeholder="Specify preferences for mental health treatments..."
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Additional Instructions',
      component: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Additional Instructions</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Wishes or Instructions
            </label>
            <textarea
              value={formData.additionalInstructions}
              onChange={(e) => handleInputChange('additionalInstructions', '', e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              rows={6}
              placeholder="Provide any additional instructions or wishes not covered in previous sections..."
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
          <h1 className="text-2xl font-bold text-gray-900">Advance Directives</h1>
          <p className="text-gray-600 mt-1">Create and manage your healthcare directives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Living Will</h2>
            <p className="text-gray-600 mb-4">
              Document your wishes for medical treatment if you become terminally ill and unable to communicate.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setFormData({ ...initialFormData, type: 'living_will' });
                  setShowLivingWillModal(true);
                }}
              >
                <FileText size={20} className="mr-2" />
                Create Living Will
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setUploadType('living_will');
                  setShowUploadModal(true);
                }}
              >
                <Upload size={20} className="mr-2" />
                Upload Existing Will
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Healthcare Directive</h2>
            <p className="text-gray-600 mb-4">
              Specify your healthcare preferences and designate a healthcare proxy.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setFormData({ ...initialFormData, type: 'healthcare_directive' });
                  setShowHealthcareDirectiveModal(true);
                }}
              >
                <FileText size={20} className="mr-2" />
                Create Healthcare Directive
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => {
                  setUploadType('healthcare_directive');
                  setShowUploadModal(true);
                }}
              >
                <Upload size={20} className="mr-2" />
                Upload Existing Directive
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
              <h3 className="font-medium mb-2">Important Information</h3>
              <p className="text-sm">
                Advance directives are state-specific legal documents. We recommend reviewing your documents with a healthcare provider and legal professional to ensure they meet your state's requirements and accurately reflect your wishes.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Document Builder Modal */}
      <Modal
        isOpen={showLivingWillModal || showHealthcareDirectiveModal}
        onClose={() => {
          setShowLivingWillModal(false);
          setShowHealthcareDirectiveModal(false);
          setCurrentStep(0);
        }}
        title={`Create ${formData.type === 'living_will' ? 'Living Will' : 'Healthcare Directive'}`}
        maxWidth="2xl"
      >
        <div className="space-y-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-idecide-accent bg-idecide-primary">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-idecide-accent">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-idecide-primary">
              <div
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-idecide-accent transition-all duration-500"
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
                  setShowLivingWillModal(false);
                  setShowHealthcareDirectiveModal(false);
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
        title={`Upload ${uploadType === 'living_will' ? 'Living Will' : 'Healthcare Directive'}`}
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
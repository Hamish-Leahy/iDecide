import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Key, Users, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDigitalAssetsStore } from '../../store/digitalAssetsStore';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  component: React.FC<{
    onComplete: (data: any) => void;
    onSkip: () => void;
  }>;
}

const BasicInfoStep: React.FC<{
  onComplete: (data: any) => void;
  onSkip: () => void;
}> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2D5959] hover:bg-[#85B1B1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D5959]"
      >
        Continue
      </button>
    </form>
  );
};

const PrioritiesStep: React.FC<{
  onComplete: (data: any) => void;
  onSkip: () => void;
}> = ({ onComplete }) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const priorities = [
    {
      id: 'wills',
      title: 'Wills & Estate Planning',
      description: 'Secure your legacy and protect your loved ones',
      icon: Key
    },
    {
      id: 'advance-care',
      title: 'Advance Care Directives',
      description: 'Make your healthcare wishes known',
      icon: Mail
    },
    {
      id: 'ndis',
      title: 'NDIS Management',
      description: 'Organize your NDIS support and services',
      icon: Users
    },
    {
      id: 'life-admin',
      title: 'General Life Admin',
      description: 'Keep your important documents organized',
      icon: Phone
    }
  ];

  const togglePriority = (id: string) => {
    setSelectedPriorities(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {priorities.map((priority) => {
          const Icon = priority.icon;
          const isSelected = selectedPriorities.includes(priority.id);
          
          return (
            <button
              key={priority.id}
              onClick={() => togglePriority(priority.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected 
                  ? 'border-[#2D5959] bg-[#B5D3D3] bg-opacity-20'
                  : 'border-gray-200 hover:border-[#85B1B1]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-[#2D5959] text-white' : 'bg-gray-100'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">{priority.title}</h3>
                  <p className="text-sm text-gray-600">{priority.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onComplete({ priorities: selectedPriorities })}
        disabled={selectedPriorities.length === 0}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2D5959] hover:bg-[#85B1B1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D5959] disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
};

const LifeStagesStep: React.FC<{
  onComplete: (data: any) => void;
  onSkip: () => void;
}> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    preferences: {
      notifications: true,
      emailUpdates: true
    }
  });

  const calculateLifeStage = (dob: string): string => {
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 25) return 'Early Career';
    if (age < 35) return 'Career Building';
    if (age < 50) return 'Family Focus';
    if (age < 65) return 'Pre-Retirement';
    return 'Retirement';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lifeStage = calculateLifeStage(formData.dateOfBirth);
    onComplete({ ...formData, lifeStage });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Emergency Contact</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.emergencyContact.name}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, name: e.target.value }
              })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            <input
              type="text"
              value={formData.emergencyContact.relationship}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
              })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.emergencyContact.phone}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
              })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.emergencyContact.email}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: { ...formData.emergencyContact, email: e.target.value }
              })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D5959] focus:ring-[#2D5959]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Preferences</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.preferences.notifications}
              onChange={(e) => setFormData({
                ...formData,
                preferences: { ...formData.preferences, notifications: e.target.checked }
              })}
              className="rounded border-gray-300 text-[#2D5959] focus:ring-[#2D5959]"
            />
            <span className="text-sm text-gray-700">Enable notifications</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.preferences.emailUpdates}
              onChange={(e) => setFormData({
                ...formData,
                preferences: { ...formData.preferences, emailUpdates: e.target.checked }
              })}
              className="rounded border-gray-300 text-[#2D5959] focus:ring-[#2D5959]"
            />
            <span className="text-sm text-gray-700">Receive email updates</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2D5959] hover:bg-[#85B1B1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D5959]"
      >
        Complete Profile
      </button>
    </form>
  );
};

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to iDecide',
    description: 'Let\'s get started with your basic information',
    isRequired: true,
    component: BasicInfoStep,
  },
  {
    id: 'priorities',
    title: 'What Would You Like Help With Today?',
    description: 'Select the areas that are most important to you',
    isRequired: true,
    component: PrioritiesStep,
  },
  {
    id: 'life-stages',
    title: 'Complete Your Profile',
    description: 'Help us personalize your experience',
    isRequired: true,
    component: LifeStagesStep,
  },
];

const OnboardingFlow = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const { setVaultCode } = useDigitalAssetsStore();

  const currentStep = steps[currentStepIndex];

  const handleStepComplete = async (data: any) => {
    const newCompletedSteps = { ...completedSteps, [currentStep.id]: data };
    setCompletedSteps(newCompletedSteps);

    if (currentStep.id === 'welcome') {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        console.error('Signup error:', error);
        return;
      }
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      navigate('/');
    }
  };

  const handleSkip = () => {
    if (currentStep.isRequired) return;
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      navigate('/');
    }
  };

  const StepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{currentStep.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{currentStep.description}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <StepComponent onComplete={handleStepComplete} onSkip={handleSkip} />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-6">
        <div className="flex justify-between px-4 sm:px-0">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index === currentStepIndex
                  ? 'text-[#2D5959]'
                  : index < currentStepIndex
                  ? 'text-green-500'
                  : 'text-gray-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === currentStepIndex
                    ? 'bg-[#2D5959] text-white'
                    : index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {index + 1}
              </div>
              <div className="mt-2 text-xs">{step.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
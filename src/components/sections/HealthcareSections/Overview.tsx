import React, { useEffect } from 'react';
import { Heart, UserCheck, Guitar as Hospital, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useHealthcareStore } from '../../../store/healthcareStore';

const MetricCard = ({ 
  icon: Icon, 
  title, 
  value, 
  bgColor = 'bg-[#2D5959]' 
}: { 
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor?: string;
}) => (
  <div className={`${bgColor} rounded-xl p-6 shadow-sm`}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const Overview = () => {
  const { 
    contacts, 
    conditions, 
    medications, 
    allergies,
    fetchContacts,
    fetchConditions,
    fetchMedications,
    fetchAllergies,
    isLoading,
    error 
  } = useHealthcareStore();

  useEffect(() => {
    fetchContacts();
    fetchConditions();
    fetchMedications();
    fetchAllergies();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5959]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading healthcare data: {error}
      </div>
    );
  }

  const activeConditions = conditions.filter(c => c.status === 'active').length;
  const currentMedications = medications.filter(m => m.isCurrent).length;
  const primaryPhysician = contacts.find(c => c.type === 'primary_care' && c.isPrimary);
  const healthcareAgent = contacts.find(c => c.type === 'healthcare_agent' && c.isPrimary);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Healthcare Overview</h2>
      
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={Heart}
          title="Active Conditions"
          value={activeConditions.toString()}
        />
        <MetricCard
          icon={Clock}
          title="Current Medications"
          value={currentMedications.toString()}
          bgColor="bg-[#85B1B1]"
        />
        <MetricCard
          icon={UserCheck}
          title="Healthcare Agents"
          value={contacts.filter(c => c.type === 'healthcare_agent').length.toString()}
        />
      </div>

      {/* Healthcare Contacts */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B5D3D3] rounded-lg">
              <Hospital className="w-6 h-6 text-[#2D5959]" />
            </div>
            <h3 className="text-xl font-bold">Healthcare Contacts</h3>
          </div>
          <button className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Care */}
          {primaryPhysician && (
            <div className="bg-[#B5D3D3] bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#2D5959] bg-opacity-10 rounded-lg">
                  <Hospital className="w-5 h-5 text-[#2D5959]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Primary Care Physician</p>
                  <p className="font-semibold">{primaryPhysician.name}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{primaryPhysician.phone}</span>
                </p>
                {primaryPhysician.organization && (
                  <p className="flex items-center gap-2">
                    <span className="text-gray-600">Hospital:</span>
                    <span className="font-medium">{primaryPhysician.organization}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Healthcare Agent */}
          {healthcareAgent && (
            <div className="bg-[#B5D3D3] bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#2D5959] bg-opacity-10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-[#2D5959]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Healthcare Agent</p>
                  <p className="font-semibold">{healthcareAgent.name}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{healthcareAgent.phone}</span>
                </p>
                {healthcareAgent.relationship && (
                  <p className="flex items-center gap-2">
                    <span className="text-gray-600">Relationship:</span>
                    <span className="font-medium">{healthcareAgent.relationship}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Items */}
      {(activeConditions > 0 || currentMedications > 0) && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#B5D3D3] rounded-lg">
              <AlertTriangle className="w-6 h-6 text-[#2D5959]" />
            </div>
            <h3 className="text-xl font-bold">Action Items</h3>
          </div>
          <div className="space-y-4">
            {activeConditions > 0 && (
              <div className="bg-[#B5D3D3] bg-opacity-10 p-4 rounded-lg">
                <p>Review and update {activeConditions} active medical conditions</p>
              </div>
            )}
            {currentMedications > 0 && (
              <div className="bg-[#B5D3D3] bg-opacity-10 p-4 rounded-lg">
                <p>Verify current medications ({currentMedications} active prescriptions)</p>
              </div>
            )}
            {allergies.length > 0 && (
              <div className="bg-[#B5D3D3] bg-opacity-10 p-4 rounded-lg">
                <p>Review {allergies.length} documented allergies</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
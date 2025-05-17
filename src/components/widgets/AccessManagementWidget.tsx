import React from 'react';
import { AlertCircle, UserPlus } from 'lucide-react';

const AccessManagementWidget: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Access Management</h3>
        <AlertCircle className="text-purple-600" size={20} />
      </div>
      <p className="text-gray-600 mb-4">
        Make sure your loved ones have access to what they need.
      </p>
      <button className="w-full bg-[#1E1B4B] text-white rounded-md py-2 hover:bg-[#1E1B4B]/90 transition-colors flex items-center justify-center gap-2">
        <UserPlus size={18} />
        <span>Invite Deputies</span>
      </button>
    </div>
  );
};

export default AccessManagementWidget;
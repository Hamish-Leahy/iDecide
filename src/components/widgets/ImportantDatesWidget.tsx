import React from 'react';
import { Calendar } from 'lucide-react';

interface Profile {
  insurance_types?: string[];
  legal_documents?: string[];
}

interface ImportantDatesWidgetProps {
  profile: Profile | null;
}

const ImportantDatesWidget: React.FC<ImportantDatesWidgetProps> = ({ profile }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Important Dates</h3>
        <Calendar className="text-indigo-600" size={20} />
      </div>
      <div className="space-y-3">
        {profile?.insurance_types?.includes('Property insurance') && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Next Month</span>
            <span className="text-gray-600">Insurance Renewal</span>
          </div>
        )}
        {profile?.legal_documents?.includes('Will') && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">In 3 months</span>
            <span className="text-gray-600">Will Review</span>
          </div>
        )}
        {(!profile?.insurance_types?.length && !profile?.legal_documents?.length) && (
          <p className="text-gray-600 text-center">No upcoming important dates</p>
        )}
      </div>
    </div>
  );
};

export default ImportantDatesWidget;
import React from 'react';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onAction,
  icon: Icon = FileText
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-[#B5D3D3] bg-opacity-30 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-[#2D5959]" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md">{description}</p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-6 py-3 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState;
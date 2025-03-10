import React from 'react';
import { Scale, FileText, UserCheck, Heart, Users, FileCheck2, Briefcase, Building2, Landmark, ScrollText, History } from 'lucide-react';
import { useLegalChangesStore } from '../../../store/legalChangesStore';
import { format } from 'date-fns';

// Shared components
export const DocumentSection: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, description, icon: Icon, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-[#B5D3D3] rounded-lg">
        <Icon className="w-6 h-6 text-[#2D5959]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#2D5959]">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

// Re-export components
export { default as Overview } from './Overview';
export { default as WillAndTestament } from './WillAndTestament';
export { default as PowerOfAttorney } from './PowerOfAttorney';
export { default as HealthcareDirective } from './HealthcareDirective';
export { default as Trusts } from './Trusts';
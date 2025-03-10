import React from 'react';
import TabNavigation from '../TabNavigation';
import { Scale, FileText, UserCheck, Heart, Users, FileCheck2, Briefcase, Building2, Landmark, ScrollText, History } from 'lucide-react';
import { useLegalChangesStore } from '../../store/legalChangesStore';
import { format } from 'date-fns';

// Component exports
export { default as Overview } from './LegalMatters/Overview';
export { default as WillAndTestament } from './LegalMatters/WillAndTestament';
export { default as PowerOfAttorney } from './LegalMatters/PowerOfAttorney';
export { default as HealthcareDirective } from './LegalMatters/HealthcareDirective';
export { default as Trusts } from './LegalMatters/Trusts';

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
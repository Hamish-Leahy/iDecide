import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TabNavigation from '../TabNavigation';
import BeneficiaryDesignations from './BeneficiaryDesignations';

// Import components from the index file
import { Overview, WillAndTestament, PowerOfAttorney, HealthcareDirective, Trusts } from './LegalMatters';

const LegalSections = () => {
  const tabs = [
    { id: 'overview', label: 'Overview', path: '/legal' },
    { id: 'will', label: 'Will & Testament', path: '/legal/will' },
    { id: 'poa', label: 'Power of Attorney', path: '/legal/poa' },
    { id: 'healthcare', label: 'Healthcare Directive', path: '/legal/healthcare' },
    { id: 'trusts', label: 'Trusts', path: '/legal/trusts' },
    { id: 'beneficiary', label: 'Beneficiary Designations', path: '/legal/beneficiary' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2D5959] mb-4">Legal Matters</h1>
      </div>

      <TabNavigation tabs={tabs} />

      <div className="mt-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="will" element={<WillAndTestament />} />
          <Route path="poa" element={<PowerOfAttorney />} />
          <Route path="healthcare" element={<HealthcareDirective />} />
          <Route path="trusts" element={<Trusts />} />
          <Route path="beneficiary" element={<BeneficiaryDesignations />} />
        </Routes>
      </div>
    </div>
  );
};

export default LegalSections;
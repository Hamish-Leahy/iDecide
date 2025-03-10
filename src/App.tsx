import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Search, Scale, DollarSign, Archive, Heart, Laptop, Menu, X } from 'lucide-react';
import TodoWidget from './components/TodoWidget';
import DashboardCard from './components/DashboardCard';
import LegalSections from './components/sections/LegalSections';
import FinanceSections from './components/sections/FinanceSections';
import DocumentVault from './components/DocumentVault/DocumentVault';
import HealthcareSections from './components/sections/HealthcareSections';
import DigitalAssets from './components/sections/DigitalAssets/DigitalAssets';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import OnboardingFlow from './components/auth/OnboardingFlow';
import SettingsPage from './components/settings/SettingsPage';
import AuthGuard from './components/auth/AuthGuard';
import AccessManagementWidget from './components/AccessManagement/AccessManagementWidget';
import NFCWidget from './components/NFC/NFCWidget';
import EmergencyIDPage from './components/NFC/EmergencyIDPage';
import { useAuthStore } from './store/authStore';
import { useLegalDocumentsStore } from './store/legalDocumentsStore';
import { useFinancialDocumentsStore } from './store/financialDocumentsStore';

// Components
const SidebarLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block px-6 py-3 rounded-lg transition-colors mb-4 ${
        isActive ? 'bg-[#85B1B1] text-white' : 'hover:bg-[#85B1B1] hover:bg-opacity-50'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

const Dashboard = () => {
  const { documents: legalDocs } = useLegalDocumentsStore();
  const { documents: financialDocs } = useFinancialDocumentsStore();

  // Calculate documents needing review
  const docsNeedingReview = legalDocs.filter(doc => doc.status === 'needs_review').length;

  // Calculate total financial value
  const totalFinancialValue = financialDocs.reduce((total, doc) => {
    const value = doc.metadata?.value ? parseFloat(doc.metadata.value) : 0;
    return total + value;
  }, 0);

  // Get total stored documents
  const totalDocuments = legalDocs.length + financialDocs.length;

  // Calculate healthcare directives status
  const healthcareLastUpdate = legalDocs
    .filter(doc => doc.documentType === 'healthcare-directive')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  
  const monthsSinceUpdate = healthcareLastUpdate 
    ? Math.floor((new Date().getTime() - new Date(healthcareLastUpdate.updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null;

  // Calculate digital assets status
  const securedAccounts = legalDocs
    .filter(doc => doc.documentType === 'digital-asset')
    .length;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Welcome to iDecide</h2>
      <p className="text-gray-600 mb-8">Your journey to peace of mind starts here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/legal">
          <DashboardCard 
            icon={Scale} 
            title="Legal Matters" 
            description={`${docsNeedingReview} document${docsNeedingReview !== 1 ? 's' : ''} need${docsNeedingReview === 1 ? 's' : ''} review`}
            className="cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/finances">
          <DashboardCard 
            icon={DollarSign} 
            title="Finances & Assets" 
            description={`Total value: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(totalFinancialValue)}`}
            className="cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/documents">
          <DashboardCard 
            icon={Archive} 
            title="Document Vault" 
            description={`${totalDocuments} document${totalDocuments !== 1 ? 's' : ''} stored`}
            className="cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/healthcare">
          <DashboardCard 
            icon={Heart} 
            title="Healthcare Wishes" 
            description={monthsSinceUpdate !== null 
              ? `Last updated ${monthsSinceUpdate} month${monthsSinceUpdate !== 1 ? 's' : ''} ago`
              : 'No healthcare directives found'}
            className="cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/digital">
          <DashboardCard 
            icon={Laptop} 
            title="Digital Assets" 
            description={`${securedAccounts} account${securedAccounts !== 1 ? 's' : ''} secured`}
            className="cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
      </div>

      {/* Mobile Widgets */}
      <div className="md:hidden space-y-6">
        <TodoWidget />
        <AccessManagementWidget />
        <NFCWidget />
      </div>
    </div>
  );
};

const AuthenticatedLayout = () => {
  const { signOut } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Left Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-60 bg-[#B5D3D3] p-6 flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <h1 className="text-2xl font-bold mb-8">iDecide</h1>
        <div className="relative mb-6">
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#85B1B1]"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        <nav className="flex-1 flex flex-col">
          <div className="flex-1">
            <SidebarLink to="/">Dashboard</SidebarLink>
            <SidebarLink to="/legal">Legal Matters</SidebarLink>
            <SidebarLink to="/finances">Finances & Assets</SidebarLink>
            <SidebarLink to="/healthcare">Healthcare Wishes</SidebarLink>
            <SidebarLink to="/digital">Digital Assets</SidebarLink>
            <SidebarLink to="/documents">Document Vault</SidebarLink>
          </div>
          <div className="mt-auto">
            <SidebarLink to="/settings">Settings</SidebarLink>
            <button
              onClick={() => signOut()}
              className="w-full px-6 py-3 text-left rounded-lg transition-colors hover:bg-red-100 text-red-600"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8">
        <div className="max-w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/legal/*" element={<LegalSections />} />
            <Route path="/finances/*" element={<FinanceSections />} />
            <Route path="/documents" element={<DocumentVault />} />
            <Route path="/healthcare/*" element={<HealthcareSections />} />
            <Route path="/digital" element={<DigitalAssets />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>

      {/* Right Sidebar - Hidden on Mobile */}
      <aside className="hidden md:block w-[280px] bg-[#f8f8f8] p-5 border-l border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex-shrink-0">
        {/* Important Dates */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h3 className="text-xl font-bold mb-6">Important Dates</h3>
          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <span className="font-medium">May 15</span>
            <span className="text-gray-600">Will Review</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <span className="font-medium">Jul 1</span>
            <span className="text-gray-600">Insurance Renewal</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <span className="font-medium">Sep 22</span>
            <span className="text-gray-600">Family Meeting</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <span className="font-medium">Nov 30</span>
            <span className="text-gray-600">Financial Review</span>
          </div>
        </div>

        {/* Widgets */}
        <TodoWidget />
        <AccessManagementWidget />
        <NFCWidget />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/id/:id" element={<EmergencyIDPage />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AuthenticatedLayout />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
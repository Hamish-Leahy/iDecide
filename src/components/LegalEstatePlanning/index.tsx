import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Scale,
  FileText,
  Users,
  Building2,
  Heart,
  Plus,
  Search,
  Filter,
  Gavel,
  ScrollText,
  UserCog,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { LegalDashboard } from './LegalDashboard';
import { WillsAndTrusts } from './WillsAndTrusts';
import { PowerOfAttorney } from './PowerOfAttorney';
import { AdvanceDirectives } from './AdvanceDirectives';
import { InsurancePolicies } from './InsurancePolicies';
import { LegalContacts } from './LegalContacts';
import { LegalChecklist } from './LegalChecklist';
import { LegalSettings } from './LegalSettings';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface LegalDocument {
  id: string;
  title: string;
  type: string;
  status: string;
}

const navItems: NavItem[] = [
  { 
    id: 'wills', 
    label: 'Wills & Trusts', 
    icon: <ScrollText size={24} />,
    description: 'Manage your will and trust documents',
    color: 'bg-emerald-50 text-emerald-600'
  },
  { 
    id: 'poa', 
    label: 'Power of Attorney', 
    icon: <UserCog size={24} />,
    description: 'Set up and manage power of attorney',
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    id: 'directives', 
    label: 'Advance Directives', 
    icon: <FileText size={24} />,
    description: 'Healthcare and medical directives',
    color: 'bg-purple-50 text-purple-600'
  },
  { 
    id: 'insurance', 
    label: 'Insurance Policies', 
    icon: <Briefcase size={24} />,
    description: 'Track insurance policies and coverage',
    color: 'bg-amber-50 text-amber-600'
  },
  { 
    id: 'contacts', 
    label: 'Legal Contacts', 
    icon: <Users size={24} />,
    description: 'Manage attorneys and legal contacts',
    color: 'bg-rose-50 text-rose-600'
  },
  { 
    id: 'checklist', 
    label: 'Legal Checklist', 
    icon: <Scale size={24} />,
    description: 'Track legal document progress',
    color: 'bg-teal-50 text-teal-600'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <Gavel size={24} />,
    description: 'Legal preferences and settings',
    color: 'bg-gray-50 text-gray-600'
  }
];

export function LegalEstatePlanning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_documents')
        .select('id, title, type, status')
        .eq('user_id', user?.id);

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/legal/${id}`);
  };

  const handleAddDocument = () => {
    navigate('/dashboard/legal/wills');
  };

  const handleCreateWill = () => {
    navigate('/dashboard/legal/wills');
  };

  const handleSetupPOA = () => {
    navigate('/dashboard/legal/poa');
  };

  const handleLegalReview = () => {
    navigate('/dashboard/legal/checklist');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Legal Estate</h1>
              <p className="text-gray-600 mt-1">
                Manage your legal documents and directives
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddDocument}
              icon={<Plus size={20} />}
            >
              Add Legal Document
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search legal documents..."
              className="flex-1"
            />
            <Button
              variant="outline"
              icon={<Filter size={20} />}
            >
              Filters
            </Button>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {navItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer h-full"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleCreateWill}
                >
                  <ScrollText size={20} className="mr-2" />
                  Create Will
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSetupPOA}
                >
                  <UserCog size={20} className="mr-2" />
                  Set Up POA
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleLegalReview}
                >
                  <Scale size={20} className="mr-2" />
                  Legal Review
                </Button>
              </div>
            </div>
          </Card>

          {/* Legal Status Overview */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Legal Document Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Will</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      documents.some(doc => doc.type === 'will' && doc.status === 'active')
                        ? 'bg-green-100 text-green-700'
                        : documents.some(doc => doc.type === 'will' && doc.status === 'draft')
                        ? 'bg-blue-100 text-blue-700'
                        : documents.some(doc => doc.type === 'will' && doc.status === 'needs_review')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {documents.some(doc => doc.type === 'will' && doc.status === 'active')
                        ? 'Up to Date'
                        : documents.some(doc => doc.type === 'will' && doc.status === 'draft')
                        ? 'In Progress'
                        : documents.some(doc => doc.type === 'will' && doc.status === 'needs_review')
                        ? 'Needs Review'
                        : 'Not Started'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Power of Attorney</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      documents.some(doc => doc.type === 'poa' && doc.status === 'active')
                        ? 'bg-green-100 text-green-700'
                        : documents.some(doc => doc.type === 'poa' && doc.status === 'draft')
                        ? 'bg-blue-100 text-blue-700'
                        : documents.some(doc => doc.type === 'poa' && doc.status === 'needs_review')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {documents.some(doc => doc.type === 'poa' && doc.status === 'active')
                        ? 'Up to Date'
                        : documents.some(doc => doc.type === 'poa' && doc.status === 'draft')
                        ? 'In Progress'
                        : documents.some(doc => doc.type === 'poa' && doc.status === 'needs_review')
                        ? 'Needs Review'
                        : 'Not Started'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Living Trust</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      documents.some(doc => doc.type === 'trust' && doc.status === 'active')
                        ? 'bg-green-100 text-green-700'
                        : documents.some(doc => doc.type === 'trust' && doc.status === 'draft')
                        ? 'bg-blue-100 text-blue-700'
                        : documents.some(doc => doc.type === 'trust' && doc.status === 'needs_review')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {documents.some(doc => doc.type === 'trust' && doc.status === 'active')
                        ? 'Up to Date'
                        : documents.some(doc => doc.type === 'trust' && doc.status === 'draft')
                        ? 'In Progress'
                        : documents.some(doc => doc.type === 'trust' && doc.status === 'needs_review')
                        ? 'Needs Review'
                        : 'Not Started'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Healthcare Directive</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      documents.some(doc => doc.type === 'directive' && doc.status === 'active')
                        ? 'bg-green-100 text-green-700'
                        : documents.some(doc => doc.type === 'directive' && doc.status === 'draft')
                        ? 'bg-blue-100 text-blue-700'
                        : documents.some(doc => doc.type === 'directive' && doc.status === 'needs_review')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {documents.some(doc => doc.type === 'directive' && doc.status === 'active')
                        ? 'Up to Date'
                        : documents.some(doc => doc.type === 'directive' && doc.status === 'draft')
                        ? 'In Progress'
                        : documents.some(doc => doc.type === 'directive' && doc.status === 'needs_review')
                        ? 'Needs Review'
                        : 'Not Started'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Life Insurance</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                      Needs Review
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estate Plan</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                      In Progress
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      } />
      <Route path="/dashboard" element={<LegalDashboard />} />
      <Route path="/wills" element={<WillsAndTrusts />} />
      <Route path="/poa" element={<PowerOfAttorney />} />
      <Route path="/directives" element={<AdvanceDirectives />} />
      <Route path="/insurance" element={<InsurancePolicies />} />
      <Route path="/contacts" element={<LegalContacts />} />
      <Route path="/checklist" element={<LegalChecklist />} />
      <Route path="/settings" element={<LegalSettings />} />
      <Route path="*" element={<Navigate to="/dashboard/legal" replace />} />
    </Routes>
  );
}
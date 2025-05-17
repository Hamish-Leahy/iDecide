import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LifeBuoy, 
  Calendar, 
  FileText, 
  Users, 
  DollarSign, 
  BarChart4, 
  Plus,
  Search,
  Filter,
  UserPlus,
  ClipboardCheck,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { NDISDashboard } from './NDISDashboard';
import { PlanDetails } from './PlanDetails';
import { ParticipantManagement } from './ParticipantManagement';
import { ServiceAgreements } from './ServiceAgreements';
import { ServiceProviders } from './ServiceProviders';
import { SupportCoordination } from './SupportCoordination';
import { BudgetTracker } from './BudgetTracker';
import { Reports } from './Reports';
import { QualityAssurance } from './QualityAssurance';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function NDISManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const navItems: NavItem[] = [
    { 
      id: 'participants', 
      label: 'Participants', 
      icon: <UserPlus size={24} />,
      description: 'Manage participant details',
      color: 'bg-teal-50 text-teal-600'
    },
    { 
      id: 'agreements', 
      label: 'Service Agreements', 
      icon: <ClipboardCheck size={24} />,
      description: 'Create and manage service agreements',
      color: 'bg-indigo-50 text-indigo-600'
    },
    { 
      id: 'plan', 
      label: 'Plan Details', 
      icon: <FileText size={24} />,
      description: 'View and manage NDIS plans',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'providers', 
      label: 'Service Providers', 
      icon: <Users size={24} />,
      description: 'Manage service providers',
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'coordination', 
      label: 'Support Coordination', 
      icon: <Calendar size={24} />,
      description: 'Track support coordination',
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 'budget', 
      label: 'Budget Tracker', 
      icon: <DollarSign size={24} />,
      description: 'Monitor NDIS funding',
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      id: 'quality', 
      label: 'Quality Assurance', 
      icon: <ShieldCheck size={24} />,
      description: 'Compliance and incident reporting',
      color: 'bg-pink-50 text-pink-600'
    },
    { 
      id: 'reports', 
      label: 'Reports & Reviews', 
      icon: <BarChart4 size={24} />,
      description: 'Generate reports and prepare for reviews',
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/ndis/${id}`);
  };

  const handleAddParticipant = () => {
    navigate('/dashboard/ndis/participants');
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NDIS Management</h1>
              <p className="text-gray-600 mt-1">
                Manage participants, plans, supports, and funding
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddParticipant}
              icon={<Plus size={20} />}
            >
              Add Participant
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search participants, providers, plans..."
              className="flex-1"
            />
            <Button
              variant="outline"
              icon={<Filter size={20} />}
            >
              Filters
            </Button>
          </div>

          {/* NDIS Overview Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <LifeBuoy className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">NDIS Participants Dashboard</h2>
                <p className="text-gray-600">Comprehensive participant management system</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="text-teal-600" size={20} />
                  <span className="font-medium text-gray-900">Participants</span>
                </div>
                <p className="text-2xl font-bold text-teal-600">
                  12
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Active participants
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardCheck className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-900">Agreements</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  8
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Current agreements
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-600" size={20} />
                  <span className="font-medium text-gray-900">Active Funding</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  $523,400
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Total active funding
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-purple-600" size={20} />
                  <span className="font-medium text-gray-900">This Week</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  14
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Scheduled services
                </p>
              </div>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/ndis/participants')}
                >
                  <UserPlus size={20} className="mr-2" />
                  Add Participant
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/ndis/agreements')}
                >
                  <ClipboardCheck size={20} className="mr-2" />
                  New Agreement
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/ndis/budget')}
                >
                  <DollarSign size={20} className="mr-2" />
                  Budget Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/ndis/quality')}
                >
                  <ShieldCheck size={20} className="mr-2" />
                  Incident Report
                </Button>
              </div>
            </div>
          </Card>
        </div>
      } />
      <Route path="/dashboard" element={<NDISDashboard />} />
      <Route path="/participants" element={<ParticipantManagement />} />
      <Route path="/agreements" element={<ServiceAgreements />} />
      <Route path="/plan" element={<PlanDetails />} />
      <Route path="/providers" element={<ServiceProviders />} />
      <Route path="/coordination" element={<SupportCoordination />} />
      <Route path="/budget" element={<BudgetTracker />} />
      <Route path="/quality" element={<QualityAssurance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="*" element={<Navigate to="/dashboard/ndis" replace />} />
    </Routes>
  );
}
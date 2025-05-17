import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Settings, 
  ListChecks, 
  Smartphone,
  Plus,
  Search,
  Filter,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { SearchInput } from './common/SearchInput';
import { LoadingSpinner } from './common/LoadingSpinner';
import { Devices } from './DigitalEstatePlanning/Devices';
import { Contacts } from './DigitalEstatePlanning/Contacts';
import { Checklist } from './DigitalEstatePlanning/Checklist';
import { Dashboard } from './DigitalEstatePlanning/Dashboard';
import { PasswordVault } from './DigitalEstatePlanning/PasswordVault';
import { Documents } from './DigitalEstatePlanning/Documents';
import { Settings as SettingsPage } from './DigitalEstatePlanning/Settings';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const navItems: NavItem[] = [
  { 
    id: 'security', 
    label: 'Password Vault', 
    icon: <Shield size={24} />,
    description: 'Manage passwords and security settings',
    color: 'bg-purple-50 text-purple-600'
  },
  { 
    id: 'documents', 
    label: 'Documents', 
    icon: <FileText size={24} />,
    description: 'Store important files and documents',
    color: 'bg-green-50 text-green-600'
  },
  { 
    id: 'devices', 
    label: 'Devices', 
    icon: <Smartphone size={24} />,
    description: 'Manage your devices and backups',
    color: 'bg-amber-50 text-amber-600'
  },
  { 
    id: 'checklist', 
    label: 'Checklist', 
    icon: <ListChecks size={24} />,
    description: 'Track your progress',
    color: 'bg-teal-50 text-teal-600'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <Settings size={24} />,
    description: 'Configure preferences',
    color: 'bg-gray-50 text-gray-600'
  }
];

export function DigitalEstatePlanning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/digital/${id}`);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleAddAsset = () => {
    navigate('/dashboard/digital/security');
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
              <h1 className="text-2xl font-bold text-gray-900">Digital Estate</h1>
              <p className="text-gray-600 mt-1">
                Manage and protect your digital legacy
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddAsset}
              icon={<Plus size={20} />}
            >
              Add Digital Asset
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search digital assets..."
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
                  onClick={() => navigate('/dashboard/digital/security')}
                >
                  <Shield size={20} className="mr-2" />
                  Password Vault
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/digital/documents')}
                >
                  <FileText size={20} className="mr-2" />
                  Documents
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/digital/checklist')}
                >
                  <ListChecks size={20} className="mr-2" />
                  View Checklist
                </Button>
              </div>
            </div>
          </Card>
        </div>
      } />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/security" element={<PasswordVault />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="/checklist" element={<Checklist />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/dashboard/digital" replace />} />
    </Routes>
  );
}
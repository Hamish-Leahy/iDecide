import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Key, 
  FileText, 
  Settings, 
  ListChecks, 
  Smartphone,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface DigitalEstatePlanningNavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems: NavItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <LayoutDashboard size={18} />,
    description: 'Overview of your digital estate'
  },
  { 
    id: 'security', 
    label: 'Password Vault', 
    icon: <Shield size={18} />,
    description: 'Manage passwords and security settings'
  },
  { 
    id: 'accounts', 
    label: 'Digital Accounts', 
    icon: <Key size={18} />,
    description: 'Track online accounts and subscriptions'
  },
  { 
    id: 'documents', 
    label: 'Documents', 
    icon: <FileText size={18} />,
    description: 'Store important digital documents'
  },
  { 
    id: 'devices', 
    label: 'Devices', 
    icon: <Smartphone size={18} />,
    description: 'Track your physical devices'
  },
  { 
    id: 'checklist', 
    label: 'Checklist', 
    icon: <ListChecks size={18} />,
    description: 'Track your digital estate planning progress'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <Settings size={18} />,
    description: 'Configure your digital estate preferences'
  }
];

export function DigitalEstatePlanningNavbar({ activeSection, onSectionChange }: DigitalEstatePlanningNavbarProps) {
  const location = useLocation();

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <Link
                key={item.id}
                to={item.id === 'dashboard' ? '/dashboard/digital' : `/dashboard/digital/${item.id}`}
                onClick={() => onSectionChange(item.id)}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden py-4 px-6 max-w-[200px]
                  text-sm font-medium text-center focus:outline-none whitespace-nowrap
                  ${isActive
                    ? 'text-[#1E1B4B] border-[#1E1B4B] border-b-2 bg-white rounded-t-lg border-l border-r border-t'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'}
                `}
                title={item.description}
              >
                <div className="flex items-center justify-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1B4B]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
import React from 'react';
import { Zap, Plus, FileText, Key, Shield, Users, Settings, HelpCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color: string;
}

interface QuickActionsWidgetProps {
  className?: string;
}

export function QuickActionsWidget({ className = '' }: QuickActionsWidgetProps) {
  const navigate = useNavigate();
  
  const quickActions: QuickAction[] = [
    {
      id: 'add-password',
      icon: <Key size={16} />,
      label: 'Add Password',
      action: () => navigate('/dashboard/digital/security'),
      color: 'bg-[#E5EDEB] text-[#1E1B4B]'
    },
    {
      id: 'add-document',
      icon: <FileText size={16} />,
      label: 'Add Document',
      action: () => navigate('/dashboard/digital/documents'),
      color: 'bg-[#E5EDEB] text-[#1E1B4B]'
    },
    {
      id: 'add-contact',
      icon: <Users size={16} />,
      label: 'Add Contact',
      action: () => navigate('/dashboard/digital/contacts'),
      color: 'bg-[#E5EDEB] text-[#1E1B4B]'
    },
    {
      id: 'security-check',
      icon: <Shield size={16} />,
      label: 'Security Check',
      action: () => navigate('/dashboard/digital/checklist'),
      color: 'bg-[#E5EDEB] text-[#1E1B4B]'
    },
    {
      id: 'settings',
      icon: <Settings size={16} />,
      label: 'Settings',
      action: () => navigate('/dashboard/digital/settings'),
      color: 'bg-[#E5EDEB] text-[#1E1B4B]'
    },
    {
      id: 'help',
      icon: <HelpCircle size={16} />,
      label: 'Help & Support',
      action: () => window.open('https://support.example.com', '_blank'),
      color: 'bg-[#E5EDEB] text-[#1E1B4B]'
    }
  ];

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap size={18} className="text-[#1E1B4B]" />
            Quick Actions
          </h3>
          <button className="p-1 rounded-full hover:bg-[#E5EDEB] text-[#1E1B4B]">
            <Plus size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#F5F8F7] transition-colors"
            >
              <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center mb-1`}>
                {action.icon}
              </div>
              <span className="text-xs text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
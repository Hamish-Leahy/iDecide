import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DollarSign, Heart, Laptop, Scale, Settings, LogOut, Plus, Users, Calendar, Bell, AlertCircle, LayoutDashboard, Cat, BookOpen, LifeBuoy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DashboardSkeleton } from './SkeletonLoader';
import { DigitalEstatePlanning } from './DigitalEstatePlanning';
import { LegalEstatePlanning } from './LegalEstatePlanning';
import { FinancialManagement } from './FinancialManagement';
import { HealthManagement } from './HealthManagement';
import { PetsManagement } from './PetsManagement';
import { NDISManagement } from './NDISManagement';
import { LegacyManagement } from './LegacyManagement';
import { WidgetSidebar } from './Sidebar/WidgetSidebar';
import { RssFeedWidget } from './widgets/RssFeedWidget';
import { SidebarConfigModal, SidebarItem, getIconComponent } from './SidebarConfig/SidebarConfigModal';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  className?: string;
}

const NavItem = React.memo<NavItemProps>(({ icon, label, active, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors text-idecide-dark
      ${active ? 'bg-idecide-primary font-medium' : 'hover:bg-idecide-primary hover:bg-opacity-50'} ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
));

NavItem.displayName = 'NavItem';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { signOut, user, profile } = useAuth();
  const [localProfile, setLocalProfile] = useState(profile);
  const navigate = useNavigate();
  const [useCustomWidgets, setUseCustomWidgets] = useState(true);
  const [showSidebarConfig, setShowSidebarConfig] = useState(false);

  // Default sidebar items
  const defaultSidebarItems: SidebarItem[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard', section: 'dashboard', visible: true },
    { id: 'digital', label: 'Digital', iconName: 'digital', section: 'digital', visible: true },
    { id: 'legal', label: 'Legal', iconName: 'legal', section: 'legal', visible: true },
    { id: 'financial', label: 'Financial', iconName: 'financial', section: 'financial', visible: true },
    { id: 'health', label: 'Health', iconName: 'health', section: 'health', visible: true },
    { id: 'pets', label: 'Pets', iconName: 'pets', section: 'pets', visible: true },
    { id: 'ndis', label: 'NDIS', iconName: 'ndis', section: 'ndis', visible: true },
    { id: 'legacy', label: 'Legacy', iconName: 'legacy', section: 'legacy', visible: true }
  ], []);

  // State for sidebar items
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(defaultSidebarItems);

  // Load sidebar configuration
  useEffect(() => {
    const loadSidebarConfig = async () => {
      if (!user) return;
      
      try {
        // First check localStorage for faster initial load
        const localConfig = localStorage.getItem(`sidebar_config_${user.id}`);
        if (localConfig) {
          setSidebarItems(JSON.parse(localConfig));
        }
        
        // Then try to load from database
        const { data, error } = await supabase
          .from('user_preferences')
          .select('sidebar_items')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error('Error loading sidebar config:', error);
          return;
        }
        
        if (data?.sidebar_items) {
          const items = JSON.parse(data.sidebar_items);
          setSidebarItems(items);
          // Update localStorage with latest from DB
          localStorage.setItem(`sidebar_config_${user.id}`, data.sidebar_items);
        }
      } catch (err) {
        console.error('Failed to load sidebar configuration:', err);
      }
    };
    
    loadSidebarConfig();
  }, [user, defaultSidebarItems]);

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    if (section === 'digital') {
      navigate('/dashboard/digital');
    } else if (section === 'legal') {
      navigate('/dashboard/legal');
    } else if (section === 'financial') {
      navigate('/dashboard/financial');
    } else if (section === 'health') {
      navigate('/dashboard/health');
    } else if (section === 'pets') {
      navigate('/dashboard/pets');
    } else if (section === 'ndis') {
      navigate('/dashboard/ndis');
    } else if (section === 'legacy') {
      navigate('/dashboard/legacy');
    } else {
      navigate('/dashboard');
    }
  };

  // Handle saving sidebar configuration
  const handleSaveSidebarConfig = (items: SidebarItem[]) => {
    setSidebarItems(items);
    
    // Save to localStorage for immediate feedback
    if (user) {
      localStorage.setItem(`sidebar_config_${user.id}`, JSON.stringify(items));
    }
  };

  // Load widget preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('useCustomWidgets');
    if (savedPreference !== null) {
      setUseCustomWidgets(savedPreference === 'true');
    }
  }, []);

  // Get visible sidebar items
  const visibleSidebarItems = useMemo(() => 
    sidebarItems.filter(item => item.visible),
  [sidebarItems]);

  // Custom function to get NDIS icon - using LifeBuoy instead of Accessibility
  const getNDISIcon = (size: number = 20) => {
    return <LifeBuoy size={size} />;
  };

  // Custom function to get Legacy icon
  const getLegacyIcon = (size: number = 20) => {
    return <BookOpen size={size} />;
  };

  // Extend the getIconComponent function to include NDIS and Legacy
  const getExtendedIconComponent = (iconName: string, size: number = 20) => {
    if (iconName === 'ndis') {
      return getNDISIcon(size);
    }
    if (iconName === 'legacy') {
      return getLegacyIcon(size);
    }
    return getIconComponent(iconName, size);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Main Sidebar */}
      <aside className="w-64 bg-idecide-primary flex flex-col">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-idecide-dark">iDecide</h1>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-3 pr-10 py-2 bg-white/80 rounded-md focus:outline-none focus:ring-2 focus:ring-idecide-secondary focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="px-2 py-4">
          <button className="w-full bg-idecide-accent text-white rounded-md py-2 flex items-center justify-center gap-2 hover:bg-idecide-accent-hover">
            <Plus size={20} />
            <span>Add New</span>
          </button>
        </div>

        <nav className="flex-1">
          <div className="mb-8">
            <div className="px-4 py-2 text-sm font-medium text-idecide-dark">MY iDECIDE</div>
            
            {/* Render visible sidebar items */}
            {visibleSidebarItems.map(item => (
              <NavItem
                key={item.id}
                icon={getExtendedIconComponent(item.iconName)}
                label={item.label}
                active={activeSection === item.section}
                onClick={() => handleNavigation(item.section)}
              />
            ))}
          </div>
        </nav>

        <div className="mt-auto border-t border-idecide-secondary/30">
          <NavItem
            icon={<Settings size={20} />}
            label="Customize Sidebar"
            onClick={() => setShowSidebarConfig(true)}
          />
          <NavItem
            icon={<LogOut size={20} />}
            label="Sign Out"
            onClick={signOut}
            className="text-red-600 hover:text-red-700"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="digital/*" element={<DigitalEstatePlanning />} />
          <Route path="legal/*" element={<LegalEstatePlanning />} />
          <Route path="financial/*" element={<FinancialManagement />} />
          <Route path="health/*" element={<HealthManagement />} />
          <Route path="pets/*" element={<PetsManagement />} />
          <Route path="ndis/*" element={<NDISManagement />} />
          <Route path="legacy/*" element={<LegacyManagement />} />
          <Route path="/" element={
            <div className="max-w-4xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back{localProfile?.full_name ? `, ${localProfile.full_name}` : ''}
                </h2>
                <p className="text-gray-600">
                  Your iDecide Score: <span className="font-semibold">{localProfile?.idecide_score || 0}</span>/500
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {visibleSidebarItems
                  .filter(item => item.section !== 'dashboard')
                  .map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.section)}
                      className="bg-idecide-primary p-6 rounded-lg transition-transform hover:scale-105 hover:shadow-lg text-left"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {getExtendedIconComponent(item.iconName)}
                        <h3 className="text-lg font-semibold text-idecide-dark">{item.label}</h3>
                      </div>
                      <p className="text-gray-600">Click to manage</p>
                    </button>
                  ))}
              </div>
              
              {/* RSS Feed Widget */}
              <div className="mb-8">
                <RssFeedWidget />
              </div>
            </div>
          } />
        </Routes>
      </main>

      {/* Widget Sidebar */}
      <WidgetSidebar className="w-80" />

      {/* Sidebar Configuration Modal */}
      <SidebarConfigModal
        isOpen={showSidebarConfig}
        onClose={() => setShowSidebarConfig(false)}
        items={sidebarItems}
        onSave={handleSaveSidebarConfig}
      />
    </div>
  );
}
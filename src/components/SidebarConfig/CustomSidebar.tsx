import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Plus, LogOut } from 'lucide-react';
import { SidebarConfigModal, SidebarItem } from './SidebarConfigModal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface CustomSidebarProps {
  className?: string;
}

export function CustomSidebar({ className = '' }: CustomSidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSidebarConfig = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
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
      } finally {
        setLoading(false);
      }
    };
    
    loadSidebarConfig();
  }, [user]);

  const handleSaveSidebarConfig = (items: SidebarItem[]) => {
    setSidebarItems(items);
    
    // Save to localStorage for immediate feedback
    if (user) {
      localStorage.setItem(`sidebar_config_${user.id}`, JSON.stringify(items));
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Dynamically render icon based on string name
  const renderIcon = (iconName: string) => {
    // This is a simplified version - in a real app, you'd import all icons
    // and map them properly
    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <span className="text-xs">{iconName.slice(0, 2)}</span>
      </div>
    );
  };

  return (
    <aside className={`w-64 bg-[#E5EDEB] flex flex-col ${className}`}>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900">iDecide</h1>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-3 pr-10 py-2 bg-white/80 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9FB3AE] focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="px-2 py-4">
        <button className="w-full bg-[#1E1B4B] text-white rounded-md py-2 flex items-center justify-center gap-2 hover:bg-[#1E1B4B]/90">
          <Plus size={20} />
          <span>Add New</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="mb-8">
          <div className="px-4 py-2 text-sm font-medium text-gray-500">NAVIGATION</div>
          
          {/* Custom sidebar items */}
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors text-gray-700
                ${location.pathname.startsWith(item.path) ? 'bg-[#E5EDEB] font-medium' : 'hover:bg-[#E5EDEB] hover:bg-opacity-50'}`}
            >
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </button>
          ))}
          
          {/* Default items if no custom items */}
          {sidebarItems.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-gray-500">
              <p className="text-sm">No navigation items configured.</p>
              <button 
                onClick={() => setShowConfigModal(true)}
                className="mt-2 text-[#1E1B4B] hover:underline text-sm"
              >
                Add your first item
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="mt-auto border-t border-[#9FB3AE]/30">
        <button
          onClick={() => setShowConfigModal(true)}
          className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors text-gray-700 hover:bg-[#E5EDEB] hover:bg-opacity-50"
        >
          <Settings size={20} />
          <span>Customize Sidebar</span>
        </button>
        <button
          onClick={signOut}
          className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors text-red-600 hover:text-red-700 hover:bg-[#E5EDEB] hover:bg-opacity-50"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
      
      {/* Configuration Modal */}
      <SidebarConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        items={sidebarItems}
        onSave={handleSaveSidebarConfig}
      />
    </aside>
  );
}
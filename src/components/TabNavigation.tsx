import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface Tab {
  id: string;
  label: string;
  path: string;
}

interface TabNavigationProps {
  tabs: Tab[];
}

const TabNavigation = ({ tabs }: TabNavigationProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isTabActive = (tabPath: string) => {
    // For root paths (e.g., /finances), only match exactly
    if (tabPath.split('/').length === 2) {
      return currentPath === tabPath;
    }
    
    // For sub-paths (e.g., /finances/investments), match if current path starts with tab path
    return currentPath.startsWith(tabPath);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-2">
      <nav className="flex flex-wrap" aria-label="Tabs">
        {tabs.map((tab) => {
          const active = isTabActive(tab.path);
            
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`
                px-6 py-3 rounded-lg transition-colors
                ${active ? 'bg-[#B5D3D3]' : 'hover:bg-gray-100'}
              `}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
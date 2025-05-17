import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { 
  Save, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Laptop,
  Scale,
  DollarSign,
  Heart,
  Cat,
  LayoutDashboard,
  Accessibility,
  BookOpen
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SortableSidebarItem } from './SortableSidebarItem';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export interface SidebarItem {
  id: string;
  label: string;
  iconName: string;
  section: string;
  visible: boolean;
}

interface SidebarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  onSave: (items: SidebarItem[]) => void;
}

// Function to get icon component from name
export const getIconComponent = (iconName: string, size: number = 20) => {
  switch (iconName) {
    case 'dashboard':
      return <LayoutDashboard size={size} />;
    case 'digital':
      return <Laptop size={size} />;
    case 'legal':
      return <Scale size={size} />;
    case 'financial':
      return <DollarSign size={size} />;
    case 'health':
      return <Heart size={size} />;
    case 'pets':
      return <Cat size={size} />;
    case 'ndis':
      return <Accessibility size={size} />;
    case 'legacy':
      return <BookOpen size={size} />;
    default:
      return <LayoutDashboard size={size} />;
  }
};

export function SidebarConfigModal({ 
  isOpen, 
  onClose, 
  items, 
  onSave 
}: SidebarConfigModalProps) {
  const { user } = useAuth();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize with current items
    setSidebarItems([...items]);
  }, [items, isOpen]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSidebarItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleItemVisibility = (id: string) => {
    setSidebarItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, visible: !item.visible } 
          : item
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save to database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            sidebar_items: JSON.stringify(sidebarItems),
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      // Call parent save handler
      onSave(sidebarItems);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sidebar configuration');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    // Reset to default configuration
    const defaultItems: SidebarItem[] = [
      { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard', section: 'dashboard', visible: true },
      { id: 'digital', label: 'Digital', iconName: 'digital', section: 'digital', visible: true },
      { id: 'legal', label: 'Legal', iconName: 'legal', section: 'legal', visible: true },
      { id: 'financial', label: 'Financial', iconName: 'financial', section: 'financial', visible: true },
      { id: 'health', label: 'Health', iconName: 'health', section: 'health', visible: true },
      { id: 'pets', label: 'Pets', iconName: 'pets', section: 'pets', visible: true },
      { id: 'ndis', label: 'NDIS', iconName: 'ndis', section: 'ndis', visible: true },
      { id: 'legacy', label: 'Legacy', iconName: 'legacy', section: 'legacy', visible: true }
    ];
    
    setSidebarItems(defaultItems);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Sidebar"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Navigation Items</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            Drag to reorder items. Toggle visibility with the eye icon. Changes will be saved when you click "Save Changes".
          </p>
          
          <div className="border rounded-lg overflow-hidden">
            {sidebarItems.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sidebarItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y">
                    {sidebarItems.map(item => (
                      <div 
                        key={item.id}
                        className={`p-4 bg-white flex items-center justify-between ${
                          !item.visible ? 'bg-gray-50 opacity-70' : ''
                        }`}
                      >
                        <SortableSidebarItem item={item} />
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleItemVisibility(item.id)}
                            className={`p-1.5 rounded-full ${
                              item.visible 
                                ? 'text-blue-600 hover:bg-blue-50' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={item.visible ? 'Hide item' : 'Show item'}
                          >
                            {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No sidebar items found. Click "Reset to Defaults" to restore.
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            icon={saving ? undefined : <Save size={16} />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
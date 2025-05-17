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
import { Settings, Plus, Save, RotateCcw, Award } from 'lucide-react';
import { SortableWidget } from './SortableWidget';
import { WidgetSelector, WidgetDefinition } from './WidgetSelector';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  QuickActionsWidget,
  RecentActivityWidget,
  CalendarWidget,
  TaskListWidget,
  SharingWidget,
  DigitalAssetsWidget,
  SecurityScoreWidget,
  UpcomingAppointmentsWidget,
  ImportantDocumentsWidget,
  DeputyAccessWidget,
  IDecideScoreWidget
} from '../widgets';

interface WidgetSidebarProps {
  className?: string;
}

export function WidgetSidebar({ className = '' }: WidgetSidebarProps) {
  const { user } = useAuth();
  
  // Define all available widgets
  const allWidgets: WidgetDefinition[] = [
    {
      id: 'quick-actions',
      name: 'Quick Actions',
      description: 'Access frequently used tools and features with one click',
      icon: <Plus />,
      component: QuickActionsWidget,
      defaultHeight: 200,
      thumbnail: '/widget-thumbnails/quick-actions.png'
    },
    {
      id: 'idecide-score',
      name: 'iDecide Score',
      description: 'Track your preparedness score and get recommendations',
      icon: <Award />,
      component: IDecideScoreWidget,
      defaultHeight: 250,
      thumbnail: '/widget-thumbnails/idecide-score.png'
    },
    {
      id: 'recent-activity',
      name: 'Recent Activity',
      description: 'Track your recent actions and changes',
      icon: <Settings />,
      component: RecentActivityWidget,
      defaultHeight: 300,
      thumbnail: '/widget-thumbnails/recent-activity.png'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'View upcoming events and important dates',
      icon: <Settings />,
      component: CalendarWidget,
      defaultHeight: 350,
      thumbnail: '/widget-thumbnails/calendar.png'
    },
    {
      id: 'tasks',
      name: 'Task List',
      description: 'Manage your to-do list and track progress',
      icon: <Settings />,
      component: TaskListWidget,
      defaultHeight: 300,
      thumbnail: '/widget-thumbnails/tasks.png'
    },
    {
      id: 'sharing',
      name: 'Document Sharing',
      description: 'Manage who has access to your documents and information',
      icon: <Settings />,
      component: SharingWidget,
      defaultHeight: 300,
      thumbnail: '/widget-thumbnails/sharing.png'
    },
    {
      id: 'digital-assets',
      name: 'Digital Assets',
      description: 'Quick overview of your digital assets and passwords',
      icon: <Settings />,
      component: DigitalAssetsWidget,
      defaultHeight: 250,
      thumbnail: '/widget-thumbnails/digital-assets.png'
    },
    {
      id: 'security-score',
      name: 'Security Score',
      description: 'Track your iDecide security score and recommendations',
      icon: <Settings />,
      component: SecurityScoreWidget,
      defaultHeight: 200,
      thumbnail: '/widget-thumbnails/security-score.png'
    },
    {
      id: 'appointments',
      name: 'Upcoming Appointments',
      description: 'View and manage your upcoming healthcare appointments',
      icon: <Settings />,
      component: UpcomingAppointmentsWidget,
      defaultHeight: 250,
      thumbnail: '/widget-thumbnails/appointments.png'
    },
    {
      id: 'important-documents',
      name: 'Important Documents',
      description: 'Quick access to your most important documents',
      icon: <Settings />,
      component: ImportantDocumentsWidget,
      defaultHeight: 250,
      thumbnail: '/widget-thumbnails/documents.png'
    },
    {
      id: 'deputy-access',
      name: 'Deputy Access',
      description: 'Manage access for your trusted deputies',
      icon: <Settings />,
      component: DeputyAccessWidget,
      defaultHeight: 250,
      thumbnail: '/widget-thumbnails/deputy-access.png'
    }
  ];
  
  // State for active widgets and their order
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>([
    'quick-actions',
    'idecide-score',
    'calendar',
    'tasks'
  ]);
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for widget selector modal
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  
  // Load saved widget configuration
  useEffect(() => {
    const loadUserWidgets = async () => {
      if (!user) return;
      
      try {
        // First check localStorage for faster initial load
        const localWidgets = localStorage.getItem(`widgets_${user.id}`);
        if (localWidgets) {
          setActiveWidgetIds(JSON.parse(localWidgets));
        }
        
        // Then try to load from database
        const { data, error } = await supabase
          .from('user_preferences')
          .select('widgets')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error('Error loading widgets:', error);
          return;
        }
        
        if (data?.widgets) {
          const widgetIds = JSON.parse(data.widgets);
          setActiveWidgetIds(widgetIds);
          // Update localStorage with latest from DB
          localStorage.setItem(`widgets_${user.id}`, data.widgets);
        } else if (!localWidgets) {
          // If no widgets in DB or localStorage, use defaults
          const defaultWidgets = ['quick-actions', 'idecide-score', 'calendar', 'tasks'];
          setActiveWidgetIds(defaultWidgets);
        }
      } catch (err) {
        console.error('Failed to load widget preferences:', err);
      }
    };
    
    loadUserWidgets();
  }, [user]);
  
  // Save widget configuration when it changes
  useEffect(() => {
    const saveUserWidgets = async () => {
      if (!user) return;
      
      // Always update localStorage for immediate feedback
      localStorage.setItem(`widgets_${user.id}`, JSON.stringify(activeWidgetIds));
      
      try {
        // Delete any existing preferences for this user
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', user.id);
          
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            widgets: JSON.stringify(activeWidgetIds),
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error saving widgets:', error);
        }
      } catch (err) {
        console.error('Failed to save widget preferences:', err);
      }
    };
    
    // Only save if we have a user and widgets have been loaded
    if (user && activeWidgetIds.length > 0) {
      saveUserWidgets();
    }
  }, [activeWidgetIds, user]);
  
  // Get active widgets based on IDs
  const activeWidgets = activeWidgetIds
    .map(id => allWidgets.find(widget => widget.id === id))
    .filter((widget): widget is WidgetDefinition => widget !== undefined);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setActiveWidgetIds(ids => {
        const oldIndex = ids.indexOf(active.id.toString());
        const newIndex = ids.indexOf(over.id.toString());
        return arrayMove(ids, oldIndex, newIndex);
      });
    }
  };
  
  // Handle widget selection
  const handleSelectWidgets = (widgetIds: string[]) => {
    setActiveWidgetIds(widgetIds);
  };
  
  // Handle reset to defaults
  const handleResetWidgets = () => {
    if (window.confirm('Reset widgets to default configuration?')) {
      setActiveWidgetIds(['quick-actions', 'idecide-score', 'calendar', 'tasks']);
    }
  };
  
  // Handle save layout
  const handleSaveLayout = () => {
    setIsEditMode(false);
    // Layout is already saved via useEffect
  };

  return (
    <div className={`bg-white border-l border-idecide-primary flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-idecide-primary">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Widgets</h2>
          <div className="flex items-center gap-1">
            {isEditMode ? (
              <>
                <button
                  onClick={handleResetWidgets}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Reset to defaults"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={handleSaveLayout}
                  className="p-1.5 text-idecide-dark hover:text-idecide-dark hover:bg-idecide-primary rounded"
                  title="Save layout"
                >
                  <Save size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Edit widgets"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Widgets Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeWidgetIds}
              strategy={verticalListSortingStrategy}
            >
              {activeWidgets.map(widget => (
                <SortableWidget
                  key={widget.id}
                  id={widget.id}
                  widget={widget}
                  isEditMode={true}
                  onRemove={(id) => {
                    setActiveWidgetIds(prev => prev.filter(widgetId => widgetId !== id));
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          activeWidgets.map(widget => {
            const WidgetComponent = widget.component;
            return <WidgetComponent key={widget.id} className="mb-4" />;
          })
        )}
        
        {isEditMode && (
          <button
            onClick={() => setShowWidgetSelector(true)}
            className="w-full p-3 border-2 border-dashed border-idecide-secondary rounded-lg text-idecide-dark hover:text-idecide-dark hover:border-idecide-primary flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Add Widget</span>
          </button>
        )}
        
        {activeWidgets.length === 0 && !isEditMode && (
          <div className="text-center py-8 text-gray-500">
            <p>No widgets added</p>
            <button
              onClick={() => setIsEditMode(true)}
              className="mt-2 text-idecide-dark hover:text-idecide-dark"
            >
              Customize your sidebar
            </button>
          </div>
        )}
      </div>
      
      {/* Widget Selector Modal */}
      <WidgetSelector
        isOpen={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        availableWidgets={allWidgets}
        activeWidgets={activeWidgetIds}
        onSelectWidgets={handleSelectWidgets}
      />
    </div>
  );
}
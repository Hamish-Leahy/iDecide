import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { WidgetDefinition } from './WidgetSelector';

interface SortableWidgetProps {
  id: string;
  widget: WidgetDefinition;
  isEditMode: boolean;
  onRemove: (id: string) => void;
}

export function SortableWidget({ id, widget, isEditMode, onRemove }: SortableWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };
  
  const WidgetComponent = widget.component;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`mb-4 rounded-lg border ${isDragging ? 'border-idecide-primary' : 'border-idecide-primary'}`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-2 bg-idecide-primary rounded-t-lg border-b border-idecide-secondary">
        <div className="flex items-center gap-2">
          {isEditMode && (
            <button 
              {...attributes} 
              {...listeners}
              className="p-1 text-idecide-dark hover:text-idecide-dark cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </button>
          )}
          <h3 className="text-sm font-medium text-idecide-dark">{widget.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-idecide-dark hover:text-idecide-dark"
            >
              <Settings size={14} />
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-idecide-dark hover:text-idecide-dark"
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          {isEditMode && (
            <button
              onClick={() => onRemove(id)}
              className="p-1 text-idecide-dark hover:text-red-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Widget Settings */}
      {showSettings && (
        <div className="p-3 bg-idecide-primary/30 border-b border-idecide-secondary">
          <div className="text-xs text-idecide-dark mb-2">Widget Settings</div>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-idecide-dark mb-1">
                Height
              </label>
              <select className="w-full p-1 text-xs border rounded focus:ring-1 focus:ring-idecide-primary focus:border-idecide-primary">
                <option>Auto</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-idecide-dark mb-1">
                Refresh Rate
              </label>
              <select className="w-full p-1 text-xs border rounded focus:ring-1 focus:ring-idecide-primary focus:border-idecide-primary">
                <option>Manual</option>
                <option>Every minute</option>
                <option>Every 5 minutes</option>
                <option>Every hour</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Widget Content */}
      {!isCollapsed && (
        <div className={`${isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
          <WidgetComponent />
        </div>
      )}
    </div>
  );
}
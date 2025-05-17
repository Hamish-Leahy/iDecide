import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { SidebarItem, getIconComponent } from './SidebarConfigModal';

interface SortableSidebarItemProps {
  item: SidebarItem;
}

export function SortableSidebarItem({ item }: SortableSidebarItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center gap-3"
    >
      <button 
        {...attributes} 
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-idecide-primary rounded-lg flex items-center justify-center text-idecide-dark">
          {getIconComponent(item.iconName)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{item.label}</p>
          <p className="text-xs text-gray-500">{item.section}</p>
        </div>
      </div>
    </div>
  );
}
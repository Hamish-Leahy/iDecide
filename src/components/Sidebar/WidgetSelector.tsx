import React, { useState } from 'react';
import { X, Search, Check, Info } from 'lucide-react';
import { Modal } from '../common/Modal';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  defaultHeight?: number;
  thumbnail?: string;
}

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: WidgetDefinition[];
  activeWidgets: string[];
  onSelectWidgets: (widgetIds: string[]) => void;
}

export function WidgetSelector({
  isOpen,
  onClose,
  availableWidgets,
  activeWidgets,
  onSelectWidgets
}: WidgetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([...activeWidgets]);
  const [previewWidget, setPreviewWidget] = useState<WidgetDefinition | null>(null);
  
  const handleToggleWidget = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };
  
  const handleSave = () => {
    onSelectWidgets(selectedWidgets);
    onClose();
  };
  
  const handleCancel = () => {
    setSelectedWidgets([...activeWidgets]);
    onClose();
  };
  
  const filteredWidgets = availableWidgets.filter(widget => 
    widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Widget Gallery"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search widgets..."
            className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-idecide-primary focus:border-idecide-primary"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWidgets.map(widget => (
            <div 
              key={widget.id}
              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedWidgets.includes(widget.id) 
                  ? 'border-idecide-primary ring-2 ring-idecide-primary' 
                  : 'border-gray-200 hover:border-idecide-secondary'
              }`}
              onClick={() => handleToggleWidget(widget.id)}
            >
              <div className="relative h-32 bg-idecide-primary flex items-center justify-center">
                {widget.thumbnail ? (
                  <img 
                    src={widget.thumbnail} 
                    alt={widget.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl text-idecide-dark">
                    {widget.icon}
                  </div>
                )}
                {selectedWidgets.includes(widget.id) && (
                  <div className="absolute top-2 right-2 bg-idecide-accent text-white rounded-full p-1">
                    <Check size={16} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{widget.name}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewWidget(widget);
                    }}
                    className="p-1 text-gray-400 hover:text-idecide-dark"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{widget.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {filteredWidgets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No widgets match your search
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedWidgets.length} widgets selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-idecide-primary text-idecide-dark rounded-lg hover:bg-idecide-primary-hover"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
      
      {/* Widget Preview Modal */}
      {previewWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{previewWidget.name}</h3>
              <button 
                onClick={() => setPreviewWidget(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="h-48 bg-idecide-primary rounded-lg flex items-center justify-center mb-4">
                {previewWidget.thumbnail ? (
                  <img 
                    src={previewWidget.thumbnail} 
                    alt={previewWidget.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-6xl text-idecide-dark">
                    {previewWidget.icon}
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{previewWidget.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Features:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Real-time updates</li>
                  <li>Customizable display</li>
                  <li>Interactive elements</li>
                  <li>Data synchronization</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPreviewWidget(null)}
                className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleToggleWidget(previewWidget.id);
                  setPreviewWidget(null);
                }}
                className={`px-3 py-1.5 rounded ${
                  selectedWidgets.includes(previewWidget.id)
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-idecide-primary text-idecide-dark hover:bg-idecide-primary-hover'
                }`}
              >
                {selectedWidgets.includes(previewWidget.id) ? 'Remove' : 'Add'} Widget
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
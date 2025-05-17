import React, { useState } from 'react';
import { Bookmark, Plus, X, Edit, ExternalLink } from 'lucide-react';
import { Card } from '../common/Card';

interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface FavoriteLinksWidgetProps {
  className?: string;
}

export function FavoriteLinksWidget({ className = '' }: FavoriteLinksWidgetProps) {
  const [links, setLinks] = useState<Link[]>([
    { id: '1', title: 'Google', url: 'https://google.com', icon: '🔍' },
    { id: '2', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: '3', title: 'Gmail', url: 'https://mail.google.com', icon: '✉️' },
    { id: '4', title: 'Calendar', url: 'https://calendar.google.com', icon: '📅' },
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: '🔗' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      if (editingId) {
        setLinks(links.map(link => 
          link.id === editingId ? { ...link, ...newLink } : link
        ));
        setEditingId(null);
      } else {
        setLinks([...links, { ...newLink, id: Date.now().toString() }]);
      }
      setNewLink({ title: '', url: '', icon: '🔗' });
      setShowAddForm(false);
    }
  };

  const handleEditLink = (link: Link) => {
    setNewLink({ title: link.title, url: link.url, icon: link.icon || '🔗' });
    setEditingId(link.id);
    setShowAddForm(true);
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleCancel = () => {
    setNewLink({ title: '', url: '', icon: '🔗' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const iconOptions = ['🔗', '🔍', '📝', '📊', '📈', '📅', '✉️', '🐙', '🌐', '⭐', '📁', '🎮', '🎬', '🎵', '📚'];

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bookmark size={18} className="text-indigo-500" />
            Bookmarks
          </h3>
          {!showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              title="Add bookmark"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        
        {showAddForm ? (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Website name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                <input 
                  type="url" 
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewLink({...newLink, icon})}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        newLink.icon === icon ? 'bg-indigo-100 border border-indigo-300' : 'hover:bg-gray-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLink}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        
        <div className="space-y-2">
          {links.map(link => (
            <div 
              key={link.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group"
            >
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <span className="text-lg">{link.icon}</span>
                <span className="text-sm font-medium text-gray-700 truncate">{link.title}</span>
                <ExternalLink size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditLink(link);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveLink(link.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          
          {links.length === 0 && !showAddForm && (
            <div className="text-center py-4 text-sm text-gray-500">
              <p>No bookmarks added yet</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-indigo-600 hover:text-indigo-800"
              >
                Add your first bookmark
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
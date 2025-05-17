import React, { useState, useEffect } from 'react';
import { Share2, Users, Lock, Shield, Eye, EyeOff, Plus, X, Check } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: string;
  name: string;
  email: string;
  is_deputy: boolean;
}

interface SharedItem {
  id: string;
  type: 'document' | 'password' | 'account' | 'section';
  name: string;
  sharedWith: string[];
}

interface SharingWidgetProps {
  className?: string;
}

export function SharingWidget({ className = '' }: SharingWidgetProps) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  // Sections that can be shared
  const sections = [
    { id: 'digital', name: 'Digital Estate' },
    { id: 'financial', name: 'Financial Management' },
    { id: 'legal', name: 'Legal Documents' },
    { id: 'health', name: 'Health Information' }
  ];
  
  // Load contacts and shared items
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Load contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('id, name, email, is_deputy')
          .eq('user_id', user.id);
          
        if (contactsError) throw contactsError;
        
        // Load digital assets with shared_with field
        const { data: assetsData, error: assetsError } = await supabase
          .from('digital_assets')
          .select('id, name, type, shared_with')
          .eq('user_id', user.id)
          .not('shared_with', 'eq', '{}');
          
        if (assetsError) throw assetsError;
        
        // Process the data
        setContacts(contactsData || []);
        
        const processedItems: SharedItem[] = (assetsData || []).map(asset => ({
          id: asset.id,
          type: asset.type === 'password' ? 'password' : 'document',
          name: asset.name,
          sharedWith: asset.shared_with || []
        }));
        
        // Add mock section sharing for demonstration
        const mockSectionSharing: SharedItem[] = [
          {
            id: 'section_health',
            type: 'section',
            name: 'Health Information',
            sharedWith: ['contact1', 'contact2']
          }
        ];
        
        setSharedItems([...processedItems, ...mockSectionSharing]);
      } catch (error) {
        console.error('Error loading sharing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  const handleAddSharing = () => {
    if (!selectedItem || selectedContacts.length === 0) return;
    
    // Find the item to share
    const itemToShare = [...sharedItems].find(item => item.id === selectedItem);
    
    if (itemToShare) {
      // Update existing item
      setSharedItems(prev => 
        prev.map(item => 
          item.id === selectedItem 
            ? { ...item, sharedWith: [...selectedContacts] }
            : item
        )
      );
    } else {
      // Create new shared item
      const newItem: SharedItem = {
        id: selectedItem,
        type: selectedItem.startsWith('section_') ? 'section' : 'document',
        name: sections.find(s => `section_${s.id}` === selectedItem)?.name || selectedItem,
        sharedWith: [...selectedContacts]
      };
      
      setSharedItems(prev => [...prev, newItem]);
    }
    
    // Reset form
    setShowAddForm(false);
    setSelectedItem(null);
    setSelectedContacts([]);
  };
  
  const handleRemoveSharing = (itemId: string) => {
    setSharedItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown';
  };
  
  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Share2 size={18} className="text-[#1E1B4B]" />
            Document Sharing
          </h3>
          {!showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="p-1 rounded-full hover:bg-[#E5EDEB] text-[#1E1B4B]"
              title="Share document"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        
        {showAddForm ? (
          <div className="mb-4 p-3 bg-[#E5EDEB] rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">What to share</label>
                <select
                  value={selectedItem || ''}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                >
                  <option value="">Select item to share</option>
                  <optgroup label="Sections">
                    {sections.map(section => (
                      <option key={section.id} value={`section_${section.id}`}>
                        {section.name} Section
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Documents">
                    <option value="doc1">Will and Testament</option>
                    <option value="doc2">Power of Attorney</option>
                    <option value="doc3">Healthcare Directive</option>
                  </optgroup>
                  <optgroup label="Financial">
                    <option value="fin1">Bank Account Details</option>
                    <option value="fin2">Investment Portfolio</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Share with</label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {contacts.length > 0 ? (
                    contacts.map(contact => (
                      <label key={contact.id} className="flex items-center gap-2 p-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          className="rounded text-[#1E1B4B] focus:ring-[#1E1B4B]"
                        />
                        <span className="text-sm">{contact.name}</span>
                        {contact.is_deputy && (
                          <span className="text-xs bg-[#E5EDEB] text-[#1E1B4B] px-1.5 py-0.5 rounded-full">
                            Deputy
                          </span>
                        )}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No contacts available
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSharing}
                  disabled={!selectedItem || selectedContacts.length === 0}
                  className="px-3 py-1 text-xs bg-[#1E1B4B] text-white rounded hover:bg-[#2D2A6A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        ) : null}
        
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {sharedItems.length > 0 ? (
            sharedItems.map(item => (
              <div 
                key={item.id}
                className="flex items-start justify-between p-2 rounded-lg hover:bg-[#F5F8F7] group"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${
                    item.type === 'section' ? 'bg-purple-100 text-purple-600' :
                    item.type === 'password' ? 'bg-blue-100 text-blue-600' :
                    item.type === 'account' ? 'bg-green-100 text-green-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {item.type === 'section' ? <Users size={14} /> :
                     item.type === 'password' ? <Lock size={14} /> :
                     item.type === 'account' ? <Shield size={14} /> :
                     <Eye size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.sharedWith.map(contactId => (
                        <span key={contactId} className="text-xs bg-[#E5EDEB] text-[#1E1B4B] px-1.5 py-0.5 rounded-full">
                          {getContactName(contactId)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSharing(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              <p>No shared items</p>
              {!showAddForm && (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-[#1E1B4B] hover:text-[#2D2A6A]"
                >
                  Share your first item
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock size={12} />
            <span>All sharing is encrypted and secure</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface LegalContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  firm?: string;
  notes?: string;
}

export function LegalContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<LegalContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    role: 'attorney',
    email: '',
    phone: '',
    firm: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  async function loadContacts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_contacts')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveContact = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_contacts')
        .insert([{
          user_id: user?.id,
          ...formData
        }])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        name: '',
        role: 'attorney',
        email: '',
        phone: '',
        firm: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('legal_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.firm?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || contact.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const roles = [
    { value: 'attorney', label: 'Attorney' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'financial_advisor', label: 'Financial Advisor' },
    { value: 'tax_professional', label: 'Tax Professional' },
    { value: 'notary', label: 'Notary' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your legal representatives and contacts</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Contact
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contacts List */}
        <div className="divide-y">
          {filteredContacts.map(contact => (
            <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {roles.find(r => r.value === contact.role)?.label || contact.role}
                    {contact.firm && ` at ${contact.firm}`}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Mail size={16} />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Phone size={16} />
                        {contact.phone}
                      </a>
                    )}
                  </div>
                  {contact.notes && (
                    <p className="text-sm text-gray-500 mt-2">{contact.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? 'No contacts match your search'
                : 'No contacts added yet'}
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Legal Contact"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Firm/Organization
            </label>
            <input
              type="text"
              value={formData.firm}
              onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveContact}
            >
              Save Contact
            </Button>
          </div>
        </div>
      </Modal>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
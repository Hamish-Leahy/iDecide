import React, { useState } from 'react';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  notes?: string;
  is_deputy: boolean;
}

export function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  async function loadContacts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
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

  async function handleSaveContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const contact = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        relationship: formData.get('relationship') as string,
        notes: formData.get('notes') as string,
        is_deputy: formData.get('is_deputy') === 'true',
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [...prev, data]);
      setShowAddForm(false);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    }
  }

  async function handleDeleteContact(id: string) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Trusted Contacts</h2>
          <p className="text-gray-600 mt-1">Manage your deputies and important contacts</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#1E1B4B] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1E1B4B]/90"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                <p className="text-sm text-gray-500">{contact.relationship}</p>
                {contact.is_deputy && (
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Deputy
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <a href={`mailto:${contact.email}`} className="hover:text-[#1E1B4B]">
                  {contact.email}
                </a>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <a href={`tel:${contact.phone}`} className="hover:text-[#1E1B4B]">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.notes && (
                <p className="text-sm text-gray-600 mt-2">{contact.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {contacts.length === 0 && !showAddForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No contacts added yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-[#1E1B4B] hover:underline"
          >
            Add your first contact
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Add Contact</h2>
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  name="relationship"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="lawyer">Lawyer</option>
                  <option value="accountant">Accountant</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_deputy"
                  value="true"
                  id="is_deputy"
                  className="rounded text-[#1E1B4B] focus:ring-[#1E1B4B]"
                />
                <label htmlFor="is_deputy" className="text-sm text-gray-700">
                  Make this contact a deputy
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E1B4B] text-white px-4 py-2 rounded-lg hover:bg-[#1E1B4B]/90"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Phone, Mail, MapPin, Users, Heart, Shield, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { motion } from 'framer-motion';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  priority: number;
}

export function EmergencyContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    alternate_phone: '',
    email: '',
    address: '',
    notes: '',
    priority: 0
  });

  const relationships = [
    'Spouse', 'Partner', 'Parent', 'Child', 'Sibling', 
    'Friend', 'Neighbor', 'Caregiver', 'Doctor', 'Other'
  ];

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  async function loadContacts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('priority', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveContact = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([{
          ...formData,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        alternate_phone: '',
        email: '',
        address: '',
        notes: '',
        priority: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContacts(prev => prev.filter(contact => contact.id !== id));
      if (selectedContact?.id === id) {
        setSelectedContact(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const handleViewContact = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group contacts by priority
  const contactsByPriority = {
    primary: filteredContacts.filter(c => c.priority === 0),
    secondary: filteredContacts.filter(c => c.priority === 1),
    tertiary: filteredContacts.filter(c => c.priority > 1)
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 0) return 'Highest Priority';
    if (priority === 1) return 'High Priority';
    if (priority === 2) return 'Medium Priority';
    return 'Low Priority';
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your emergency contacts</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Contact
        </Button>
      </div>

      {/* Emergency Contact Card Design */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-100 shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-100 rounded-lg">
            <Heart className="text-red-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Emergency Contact List</h2>
            <p className="text-gray-600">People to contact in case of emergency</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search contacts..."
            className="w-full"
          />
        </div>

        {/* Emergency Contact Cards */}
        {filteredContacts.length > 0 ? (
          <div className="space-y-8">
            {/* Primary Contacts */}
            {contactsByPriority.primary.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-red-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <Shield size={20} />
                    <h3 className="text-lg font-semibold">Primary Contacts</h3>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contactsByPriority.primary.map(contact => (
                    <EmergencyContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onDelete={handleDeleteContact}
                      onClick={() => handleViewContact(contact)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Contacts */}
            {contactsByPriority.secondary.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-orange-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <Shield size={20} />
                    <h3 className="text-lg font-semibold">Secondary Contacts</h3>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contactsByPriority.secondary.map(contact => (
                    <EmergencyContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onDelete={handleDeleteContact}
                      onClick={() => handleViewContact(contact)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Contacts */}
            {contactsByPriority.tertiary.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    <h3 className="text-lg font-semibold">Additional Contacts</h3>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contactsByPriority.tertiary.map(contact => (
                    <EmergencyContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onDelete={handleDeleteContact}
                      onClick={() => handleViewContact(contact)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-red-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Contacts Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'No contacts match your search criteria'
                : 'You haven\'t added any emergency contacts yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Emergency Contact
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Emergency Information Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Emergency Information</h2>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-red-600" size={20} />
              <h3 className="font-medium text-red-800">In Case of Emergency</h3>
            </div>
            <p className="text-red-700 text-sm mb-4">
              Make sure your emergency contacts are up to date and easily accessible. Consider sharing this information with trusted individuals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-red-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Medical Alert Information</h4>
                <p className="text-sm text-gray-600">
                  Add any critical medical information that emergency responders should know about.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">ICE Contacts</h4>
                <p className="text-sm text-gray-600">
                  Mark your primary emergency contacts as "ICE" (In Case of Emergency) in your phone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Emergency Contact"
        maxWidth="xl"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Enter contact's full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select relationship</option>
              {relationships.map(relationship => (
                <option key={relationship} value={relationship}>
                  {relationship}
                </option>
              ))}
            </select>
            {formData.relationship === 'Other' && (
              <input
                type="text"
                placeholder="Specify relationship"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 mt-2"
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="(123) 456-7890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Phone
            </label>
            <input
              type="tel"
              value={formData.alternate_phone}
              onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="(123) 456-7890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Enter contact's address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="0">Highest Priority (Primary Contact)</option>
              <option value="1">High Priority (Secondary Contact)</option>
              <option value="2">Medium Priority</option>
              <option value="3">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Additional notes or instructions"
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

      {/* Contact Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedContact ? selectedContact.name : 'Contact Details'}
        maxWidth="xl"
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <Users className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-red-600">{selectedContact.relationship}</p>
                </div>
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {getPriorityLabel(selectedContact.priority)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Primary Phone</h4>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone size={18} className="text-red-500" />
                      <a href={`tel:${selectedContact.phone}`} className="hover:text-red-600">
                        {selectedContact.phone}
                      </a>
                    </div>
                  </div>

                  {selectedContact.alternate_phone && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Alternate Phone</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Phone size={18} className="text-red-500" />
                        <a href={`tel:${selectedContact.alternate_phone}`} className="hover:text-red-600">
                          {selectedContact.alternate_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedContact.email && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Mail size={18} className="text-red-500" />
                        <a href={`mailto:${selectedContact.email}`} className="hover:text-red-600">
                          {selectedContact.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedContact.address && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                      <div className="flex items-start gap-2 text-gray-900">
                        <MapPin size={18} className="text-red-500 flex-shrink-0 mt-1" />
                        <span>{selectedContact.address}</span>
                      </div>
                    </div>
                  )}

                  {selectedContact.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-gray-700">
                        {selectedContact.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-100 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle size={18} />
                  <span className="font-medium">Emergency Instructions</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This contact is designated as a {getPriorityLabel(selectedContact.priority).toLowerCase()} emergency contact. 
                  In case of emergency, contact them {selectedContact.priority === 0 ? 'first' : selectedContact.priority === 1 ? 'if primary contact is unavailable' : 'if higher priority contacts are unavailable'}.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                color="danger"
                onClick={() => {
                  handleDeleteContact(selectedContact.id);
                }}
              >
                Delete Contact
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

// Emergency Contact Card Component
function EmergencyContactCard({ 
  contact, 
  onDelete,
  onClick
}: { 
  contact: EmergencyContact; 
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-lg p-4 cursor-pointer border ${
        contact.priority === 0 
          ? 'border-red-300 shadow-sm' 
          : contact.priority === 1
          ? 'border-orange-200'
          : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{contact.name}</h4>
            {contact.priority === 0 && (
              <Star className="text-yellow-500" size={16} />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {contact.relationship}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(contact.id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} />
          <a href={`tel:${contact.phone}`} className="hover:text-red-600">
            {contact.phone}
          </a>
        </div>
        
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} />
            <a href={`mailto:${contact.email}`} className="hover:text-red-600 truncate">
              {contact.email}
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
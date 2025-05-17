import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Clock, 
  Save, 
  X, 
  Search, 
  Filter, 
  AlertCircle, 
  Send, 
  User, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface Letter {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  date: string;
  delivery_date?: string;
  status: 'draft' | 'scheduled' | 'delivered';
}

export function Letters() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'draft' as 'draft' | 'scheduled' | 'delivered'
  });

  // Common recipients
  const commonRecipients = [
    'Spouse', 'Son', 'Daughter', 'Grandchild', 'Friend', 'Sibling', 'Parent', 'Future Self', 'All Family Members'
  ];

  useEffect(() => {
    const loadLetters = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load letters from database
        const { data, error } = await supabase
          .from('legacy_letters')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setLetters(data || []);
      } catch (err) {
        console.error('Error loading letters:', err);
        setError(err instanceof Error ? err.message : 'Failed to load letters');
      } finally {
        setLoading(false);
      }
    };
    
    loadLetters();
  }, [user]);

  const handleAddLetter = () => {
    setFormData({
      recipient: '',
      subject: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: 'draft'
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleEditLetter = (letter: Letter) => {
    setSelectedLetter(letter);
    setFormData({
      recipient: letter.recipient,
      subject: letter.subject,
      content: letter.content,
      date: letter.date,
      delivery_date: letter.delivery_date || '',
      status: letter.status
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleViewLetter = (letter: Letter) => {
    setSelectedLetter(letter);
    setShowViewModal(true);
  };

  const handleDeleteLetter = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this letter? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('legacy_letters')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setLetters(letters.filter(letter => letter.id !== id));
      } catch (err) {
        console.error('Error deleting letter:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete letter');
      }
    }
  };

  const handleSaveLetter = async () => {
    // Validate form
    if (!formData.recipient || !formData.subject || !formData.content || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }
    
    // If status is scheduled, delivery date is required
    if (formData.status === 'scheduled' && !formData.delivery_date) {
      setError('Please specify a delivery date for scheduled letters');
      return;
    }
    
    try {
      if (isEditing && selectedLetter) {
        // Update existing letter
        const { error } = await supabase
          .from('legacy_letters')
          .update({
            recipient: formData.recipient,
            subject: formData.subject,
            content: formData.content,
            date: formData.date,
            delivery_date: formData.delivery_date || null,
            status: formData.status
          })
          .eq('id', selectedLetter.id);
          
        if (error) throw error;
        
        // Update local state
        setLetters(letters.map(letter => 
          letter.id === selectedLetter.id 
            ? {
                ...letter,
                recipient: formData.recipient,
                subject: formData.subject,
                content: formData.content,
                date: formData.date,
                delivery_date: formData.delivery_date || undefined,
                status: formData.status
              } 
            : letter
        ));
      } else {
        // Add new letter
        const { data, error } = await supabase
          .from('legacy_letters')
          .insert([{
            user_id: user?.id,
            recipient: formData.recipient,
            subject: formData.subject,
            content: formData.content,
            date: formData.date,
            delivery_date: formData.delivery_date || null,
            status: formData.status
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state
        if (data) {
          setLetters([data, ...letters]);
        }
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      setSelectedLetter(null);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error saving letter:', err);
      setError(err instanceof Error ? err.message : 'Failed to save letter');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter letters based on search query and selected status
  const filteredLetters = letters.filter(letter => {
    const matchesSearch = 
      letter.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || letter.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Letters</h1>
          <p className="text-gray-600 mt-1">Write letters to your loved ones for now or the future</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddLetter}
          icon={<Plus size={20} />}
        >
          Write Letter
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search letters..."
          className="flex-1"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Letters</h2>
          
          {filteredLetters.length > 0 ? (
            <div className="space-y-4">
              {filteredLetters.map(letter => (
                <div 
                  key={letter.id} 
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleViewLetter(letter)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0 mt-1">
                        <Mail className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{letter.subject}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            letter.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            letter.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">To: {letter.recipient}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{letter.content}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>Created: {formatDate(letter.date)}</span>
                          </div>
                          {letter.delivery_date && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>Delivery: {formatDate(letter.delivery_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLetter(letter);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                        title="Edit letter"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLetter(letter.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                        title="Delete letter"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No letters found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedStatus !== 'all'
                  ? 'No letters match your search or filter'
                  : 'Get started by writing your first letter'}
              </p>
              {!searchQuery && selectedStatus === 'all' && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={handleAddLetter}
                    icon={<Plus size={20} />}
                  >
                    Write Letter
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Letter Ideas */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Letter Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Life Lessons & Wisdom</h3>
              <p className="text-sm text-gray-600 mb-3">
                Share important life lessons, values, and wisdom you've gained through experience.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    subject: 'Life Lessons I Want to Share',
                    recipient: ''
                  });
                  setShowAddModal(true);
                }}
              >
                Start Writing
              </Button>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Future Milestones</h3>
              <p className="text-sm text-gray-600 mb-3">
                Write letters for future milestones like graduations, weddings, or births.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    subject: 'For Your Special Day',
                    recipient: ''
                  });
                  setShowAddModal(true);
                }}
              >
                Start Writing
              </Button>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Family History</h3>
              <p className="text-sm text-gray-600 mb-3">
                Document your family history, traditions, and stories for future generations.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    subject: 'Our Family History',
                    recipient: 'All Family Members'
                  });
                  setShowAddModal(true);
                }}
              >
                Start Writing
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Add/Edit Letter Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isEditing ? "Edit Letter" : "Write a Letter"}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient*
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Who is this letter for?"
                  list="common-recipients"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <datalist id="common-recipients">
                  {commonRecipients.map(recipient => (
                    <option key={recipient} value={recipient} />
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject*
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a subject for your letter"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Letter Content*
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Write your letter here..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Written*
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled for Future Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {formData.status === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date*
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This letter will be made available to the recipient on this date.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveLetter}
              icon={formData.status === 'scheduled' ? <Clock size={16} /> : <Save size={16} />}
            >
              {isEditing ? 'Update Letter' : 
               formData.status === 'scheduled' ? 'Schedule Letter' : 'Save Letter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Letter Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedLetter?.subject || "Letter"}
        maxWidth="2xl"
      >
        {selectedLetter && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">To:</span>
                  <span className="font-medium text-gray-900">{selectedLetter.recipient}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Written: {formatDate(selectedLetter.date)}</span>
                  </div>
                  {selectedLetter.delivery_date && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>Delivery: {formatDate(selectedLetter.delivery_date)}</span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedLetter.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    selectedLetter.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedLetter.status.charAt(0).toUpperCase() + selectedLetter.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit size={14} />}
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditLetter(selectedLetter);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  color="danger"
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    setShowViewModal(false);
                    handleDeleteLetter(selectedLetter.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="prose max-w-none">
                {selectedLetter.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {selectedLetter.status === 'draft' && (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  icon={<Send size={16} />}
                  onClick={async () => {
                    try {
                      // Update letter status to scheduled
                      const { error } = await supabase
                        .from('legacy_letters')
                        .update({ 
                          status: 'scheduled', 
                          delivery_date: selectedLetter.delivery_date || new Date().toISOString().split('T')[0] 
                        })
                        .eq('id', selectedLetter.id);
                        
                      if (error) throw error;
                      
                      // Update local state
                      setLetters(letters.map(letter => 
                        letter.id === selectedLetter.id 
                          ? { 
                              ...letter, 
                              status: 'scheduled', 
                              delivery_date: letter.delivery_date || new Date().toISOString().split('T')[0] 
                            } 
                          : letter
                      ));
                      
                      setShowViewModal(false);
                    } catch (err) {
                      console.error('Error scheduling letter:', err);
                      setError(err instanceof Error ? err.message : 'Failed to schedule letter');
                    }
                  }}
                >
                  Schedule Delivery
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
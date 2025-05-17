import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Tag, 
  Save, 
  X, 
  Search, 
  Filter, 
  AlertCircle, 
  Star, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface LegacyNote {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  tags?: string[];
  is_private: boolean;
  is_important: boolean;
}

export function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LegacyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<LegacyNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    category: 'wishes',
    tags: [''],
    is_private: false,
    is_important: false
  });

  // Note categories
  const categories = [
    { id: 'wishes', label: 'Wishes & Requests' },
    { id: 'values', label: 'Values & Beliefs' },
    { id: 'advice', label: 'Advice & Wisdom' },
    { id: 'legacy', label: 'Legacy Planning' },
    { id: 'personal', label: 'Personal Reflections' },
    { id: 'other', label: 'Other' }
  ];

  // Common tags
  const commonTags = [
    'important', 'personal', 'family', 'financial', 'healthcare', 
    'funeral', 'digital', 'property', 'wishes', 'values'
  ];

  useEffect(() => {
    const loadNotes = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // In a real app, you would fetch from a legacy_notes table
        // For now, we'll use mock data
        
        // Mock notes
        const mockNotes: LegacyNote[] = [
          {
            id: '1',
            title: 'My Funeral Wishes',
            content: 'I would like my funeral to be a celebration of life rather than a somber occasion. Please play my favorite music, share happy memories, and don\'t spend too much on elaborate arrangements.\n\nI prefer cremation, with my ashes scattered at our family\'s lake house where we\'ve shared so many wonderful memories.\n\nIn lieu of flowers, I would appreciate donations to the American Cancer Society, a cause that has been important to me throughout my life.',
            date: '2025-04-05',
            category: 'wishes',
            tags: ['funeral', 'important', 'wishes'],
            is_private: true,
            is_important: true
          },
          {
            id: '2',
            title: 'Family Heirlooms Distribution',
            content: 'I\'ve given careful thought to the distribution of family heirlooms, considering both sentimental value and each person\'s connection to these items:\n\n- Grandmother\'s pearl necklace: To my daughter Sarah\n- Grandfather\'s pocket watch: To my son Michael\n- Family Bible: To my son James\n- Wedding china: To be divided equally among all children\n- Photo albums: To be digitized and shared with everyone, originals to Emma\n- My collection of first edition books: To my grandson Thomas, who shares my love of literature\n\nPlease respect these wishes and avoid conflict over material possessions. The memories and values we\'ve shared are the true inheritance I leave behind.',
            date: '2025-03-28',
            category: 'legacy',
            tags: ['heirlooms', 'important', 'family'],
            is_private: true,
            is_important: true
          },
          {
            id: '3',
            title: 'Core Values I Hope to Pass On',
            content: 'Throughout my life, I\'ve been guided by certain core values that have served me well. I hope these values continue to influence future generations of our family:\n\n1. Integrity - Always do what\'s right, even when no one is watching.\n\n2. Compassion - Treat others with kindness and empathy. Everyone is fighting their own battles.\n\n3. Perseverance - Life will present challenges; face them with determination and resilience.\n\n4. Curiosity - Never stop learning and questioning. An open mind leads to a rich life.\n\n5. Gratitude - Appreciate what you have rather than focusing on what you lack.\n\n6. Family - Nurture your relationships with family members; they are your strongest support system.\n\n7. Generosity - Share your time, talents, and resources with others.\n\nI\'ve tried to demonstrate these values through my actions, and I\'ve seen them reflected back in all of you. This gives me great peace and satisfaction.',
            date: '2025-03-20',
            category: 'values',
            tags: ['values', 'family', 'wisdom'],
            is_private: false,
            is_important: true
          },
          {
            id: '4',
            title: 'Financial Advice for My Children',
            content: 'Having managed finances for many decades, I want to share some principles that have served me well:\n\n1. Live below your means. The gap between what you earn and what you spend is your path to financial freedom.\n\n2. Start investing early and consistently. Time in the market beats timing the market.\n\n3. Maintain an emergency fund of 3-6 months of expenses.\n\n4. Be cautious with debt. Distinguish between productive debt (education, reasonable mortgage) and consumer debt.\n\n5. Don\'t try to keep up with others. Their financial situation is not yours.\n\n6. Give generously. Helping others brings joy and perspective.\n\n7. Remember that money is a tool, not an end in itself. Use it to create a meaningful life, not just to accumulate possessions.\n\nI hope these principles help guide your financial decisions and lead to security and peace of mind.',
            date: '2025-03-15',
            category: 'advice',
            tags: ['financial', 'advice', 'wisdom'],
            is_private: false,
            is_important: false
          },
          {
            id: '5',
            title: 'My Digital Legacy',
            content: 'In today\'s digital world, I want to ensure my online presence is properly managed after I\'m gone:\n\n1. Password manager: I use LastPass. The master password is stored with my attorney.\n\n2. Social media accounts: I prefer that my Facebook and Instagram accounts be memorialized rather than deleted.\n\n3. Email accounts: Please close these after checking for any important communications.\n\n4. Digital photos: All family photos are backed up on Google Photos and an external hard drive in my desk. Please share these with the family.\n\n5. Subscription services: Cancel all recurring subscriptions and memberships.\n\n6. Digital assets: I own some cryptocurrency - details are with my financial documents.\n\nI\'ve appointed my son James as my digital executor to handle these matters.',
            date: '2025-03-10',
            category: 'legacy',
            tags: ['digital', 'important', 'legacy'],
            is_private: true,
            is_important: true
          },
          {
            id: '6',
            title: 'Reflections on Parenthood',
            content: 'Being your parent has been the greatest privilege of my life. As I reflect on this journey, I want to share some thoughts:\n\nRaising children is both the hardest and most rewarding thing I\'ve ever done. There were times of exhaustion, worry, and self-doubt, but they were far outweighed by the moments of joy, pride, and profound love.\n\nI wasn\'t a perfect parent - no one is. I made mistakes along the way, and for those, I ask your forgiveness. Every decision was made with love and the best intentions, even when the outcomes weren\'t what I hoped.\n\nWatching you grow into the adults you\'ve become has been my life\'s greatest joy. Your kindness, integrity, and resilience fill me with immense pride.\n\nThank you for the gift of being your parent. The love between parent and child is truly like no other.',
            date: '2025-03-05',
            category: 'personal',
            tags: ['family', 'reflections', 'parenting'],
            is_private: false,
            is_important: false
          }
        ];
        
        setNotes(mockNotes);
      } catch (err) {
        console.error('Error loading notes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };
    
    loadNotes();
  }, [user]);

  const handleAddNote = () => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      category: 'wishes',
      tags: [''],
      is_private: false,
      is_important: false
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleEditNote = (note: LegacyNote) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      date: note.date,
      category: note.category,
      tags: note.tags || [''],
      is_private: note.is_private,
      is_important: note.is_important
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleViewNote = (note: LegacyNote) => {
    setSelectedNote(note);
    setShowViewModal(true);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const handleAddTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, '']
    });
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  const handleSaveNote = () => {
    // Validate form
    if (!formData.title || !formData.content || !formData.date || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Filter out empty tags
    const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
    
    if (isEditing && selectedNote) {
      // Update existing note
      const updatedNote: LegacyNote = {
        ...selectedNote,
        title: formData.title,
        content: formData.content,
        date: formData.date,
        category: formData.category,
        tags: filteredTags.length > 0 ? filteredTags : undefined,
        is_private: formData.is_private,
        is_important: formData.is_important
      };
      
      setNotes(notes.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
    } else {
      // Add new note
      const newNote: LegacyNote = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        date: formData.date,
        category: formData.category,
        tags: filteredTags.length > 0 ? filteredTags : undefined,
        is_private: formData.is_private,
        is_important: formData.is_important
      };
      
      setNotes([newNote, ...notes]);
    }
    
    // Close modal and reset form
    setShowAddModal(false);
    setSelectedNote(null);
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.label : categoryId;
  };

  // Get all unique tags from notes
  const allTags = Array.from(new Set(
    notes.flatMap(note => note.tags || [])
  )).sort();

  // Filter notes based on search query and selected category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
          <h1 className="text-2xl font-bold text-gray-900">Legacy Notes</h1>
          <p className="text-gray-600 mt-1">Document important wishes, values, and information</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddNote}
          icon={<Plus size={20} />}
        >
          Add Note
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-4">
          <Card>
            <div className="p-4">
              <h2 className="font-medium text-gray-900 mb-3">Categories</h2>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
                  }`}
                >
                  All Notes
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <h2 className="font-medium text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
                {allTags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags yet</p>
                )}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <h2 className="font-medium text-gray-900 mb-3">Note Stats</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Notes:</span>
                  <span className="font-medium">{notes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Important:</span>
                  <span className="font-medium">
                    {notes.filter(note => note.is_important).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Private:</span>
                  <span className="font-medium">
                    {notes.filter(note => note.is_private).length}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Legacy Notes</h2>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search notes..."
                  className="w-48 md:w-64"
                />
              </div>
              
              {filteredNotes.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotes.map(note => (
                    <div 
                      key={note.id} 
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleViewNote(note)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-green-100 rounded-lg flex-shrink-0 mt-1">
                            <FileText className="text-green-600" size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{note.title}</h3>
                              {note.is_important && (
                                <Star className="text-amber-500" size={16} />
                              )}
                              {note.is_private && (
                                <Lock className="text-gray-500" size={16} />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {getCategoryLabel(note.category)} • {formatDate(note.date)}
                            </p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{note.content}</p>
                            
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.map((tag, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50"
                            title="Edit note"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                            title="Delete note"
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
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedCategory !== 'all'
                      ? 'No notes match your search or filter'
                      : 'Get started by creating your first legacy note'}
                  </p>
                  {!searchQuery && selectedCategory === 'all' && (
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={handleAddNote}
                        icon={<Plus size={20} />}
                      >
                        Add Note
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isEditing ? "Edit Legacy Note" : "New Legacy Note"}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter a title for your note"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date*
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Content*
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Write your note here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter a tag (e.g., important, wishes)"
                    list="common-tags"
                  />
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <datalist id="common-tags">
                    {commonTags.map(tag => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded"
                  disabled={formData.tags.length <= 1 && index === 0}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTag}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              + Add Another Tag
            </button>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_important}
                onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <div className="flex items-center gap-1">
                <Star size={16} className="text-amber-500" />
                <span className="text-sm text-gray-700">Mark as Important</span>
              </div>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                className="rounded text-gray-500 focus:ring-gray-500"
              />
              <div className="flex items-center gap-1">
                <Lock size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">Mark as Private</span>
              </div>
            </label>
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
              onClick={handleSaveNote}
              icon={<Save size={16} />}
            >
              {isEditing ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Note Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedNote?.title || "Legacy Note"}
        maxWidth="2xl"
      >
        {selectedNote && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  {getCategoryLabel(selectedNote.category)}
                </span>
                <span className="text-sm text-gray-500">{formatDate(selectedNote.date)}</span>
                {selectedNote.is_important && (
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <Star size={14} />
                    <span>Important</span>
                  </span>
                )}
                {selectedNote.is_private && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Lock size={14} />
                    <span>Private</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit size={14} />}
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditNote(selectedNote);
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
                    handleDeleteNote(selectedNote.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="prose max-w-none">
                {selectedNote.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {selectedNote.tags && selectedNote.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-gray-500" />
                <div className="flex flex-wrap gap-1">
                  {selectedNote.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
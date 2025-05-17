import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Tag, 
  Image as ImageIcon, 
  Save, 
  X, 
  Search, 
  Filter, 
  Smile, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
  images?: string[];
}

export function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: '',
    tags: [''],
    images: ['']
  });

  // Common moods
  const moods = [
    'happy', 'grateful', 'reflective', 'peaceful', 'nostalgic', 
    'hopeful', 'proud', 'loving', 'inspired', 'content'
  ];

  // Common tags
  const commonTags = [
    'family', 'memories', 'childhood', 'career', 'travel', 
    'lessons', 'wisdom', 'milestones', 'relationships', 'health'
  ];

  useEffect(() => {
    const loadEntries = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load journal entries from database
        const { data, error } = await supabase
          .from('legacy_journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setEntries(data || []);
      } catch (err) {
        console.error('Error loading journal entries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load journal entries');
      } finally {
        setLoading(false);
      }
    };
    
    loadEntries();
  }, [user]);

  const handleAddEntry = () => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: '',
      tags: [''],
      images: ['']
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      date: entry.date,
      mood: entry.mood || '',
      tags: entry.tags || [''],
      images: entry.images || ['']
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('legacy_journal_entries')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setEntries(entries.filter(entry => entry.id !== id));
      } catch (err) {
        console.error('Error deleting journal entry:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete journal entry');
      }
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

  const handleAddImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleSaveEntry = async () => {
    // Validate form
    if (!formData.title || !formData.content || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Filter out empty tags and images
    const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
    const filteredImages = formData.images.filter(image => image.trim() !== '');
    
    try {
      if (isEditing && selectedEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('legacy_journal_entries')
          .update({
            title: formData.title,
            content: formData.content,
            date: formData.date,
            mood: formData.mood || null,
            tags: filteredTags.length > 0 ? filteredTags : null,
            images: filteredImages.length > 0 ? filteredImages : null
          })
          .eq('id', selectedEntry.id);
          
        if (error) throw error;
        
        // Update local state
        setEntries(entries.map(entry => 
          entry.id === selectedEntry.id 
            ? {
                ...entry,
                title: formData.title,
                content: formData.content,
                date: formData.date,
                mood: formData.mood || undefined,
                tags: filteredTags.length > 0 ? filteredTags : undefined,
                images: filteredImages.length > 0 ? filteredImages : undefined
              } 
            : entry
        ));
      } else {
        // Add new entry
        const { data, error } = await supabase
          .from('legacy_journal_entries')
          .insert([{
            user_id: user?.id,
            title: formData.title,
            content: formData.content,
            date: formData.date,
            mood: formData.mood || null,
            tags: filteredTags.length > 0 ? filteredTags : null,
            images: filteredImages.length > 0 ? filteredImages : null
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state
        if (data) {
          setEntries([data, ...entries]);
        }
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      setSelectedEntry(null);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to save journal entry');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get all unique tags from entries
  const allTags = Array.from(new Set(
    entries.flatMap(entry => entry.tags || [])
  )).sort();

  // Filter entries based on search query and selected tag
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.mood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesTag = selectedTag === 'all' || (entry.tags && entry.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
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
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600 mt-1">Record your thoughts, memories, and life stories</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddEntry}
          icon={<Plus size={20} />}
        >
          New Entry
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
              <h2 className="font-medium text-gray-900 mb-3">Filter by Tag</h2>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTag === 'all' ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100'
                  }`}
                >
                  All Entries
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedTag === tag ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <h2 className="font-medium text-gray-900 mb-3">Journal Stats</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Entries:</span>
                  <span className="font-medium">{entries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month:</span>
                  <span className="font-medium">
                    {entries.filter(entry => {
                      const entryDate = new Date(entry.date);
                      const now = new Date();
                      return entryDate.getMonth() === now.getMonth() && 
                             entryDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">With Photos:</span>
                  <span className="font-medium">
                    {entries.filter(entry => entry.images && entry.images.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Used Tag:</span>
                  <span className="font-medium">
                    {allTags.length > 0 ? 
                      allTags.reduce((a, b) => {
                        const countA = entries.filter(entry => entry.tags && entry.tags.includes(a)).length;
                        const countB = entries.filter(entry => entry.tags && entry.tags.includes(b)).length;
                        return countA > countB ? a : b;
                      }) : 
                      'None'
                    }
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
                <h2 className="text-lg font-semibold">Journal Entries</h2>
                <div className="flex items-center gap-2">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search entries..."
                    className="w-48 md:w-64"
                  />
                </div>
              </div>
              
              {filteredEntries.length > 0 ? (
                <div className="space-y-4">
                  {filteredEntries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleViewEntry(entry)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0 mt-1">
                            <BookOpen className="text-amber-600" size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{entry.title}</h3>
                              {entry.mood && (
                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                  {entry.mood}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(entry.date)}</p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{entry.content}</p>
                            
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.tags.map((tag, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {entry.images && entry.images.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {entry.images.map((image, index) => (
                                  <div key={index} className="w-16 h-16 rounded-md overflow-hidden">
                                    <img src={image} alt="Journal entry" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEntry(entry);
                            }}
                            className="p-2 text-gray-400 hover:text-amber-600 rounded-full hover:bg-amber-50"
                            title="Edit entry"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                            title="Delete entry"
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
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No journal entries</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedTag !== 'all'
                      ? 'No entries match your search or filter'
                      : 'Get started by creating your first journal entry'}
                  </p>
                  {!searchQuery && selectedTag === 'all' && (
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={handleAddEntry}
                        icon={<Plus size={20} />}
                      >
                        New Journal Entry
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Entry Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isEditing ? "Edit Journal Entry" : "New Journal Entry"}
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Enter a title for your journal entry"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date*
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mood
              </label>
              <div className="relative">
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select a mood (optional)</option>
                  {moods.map(mood => (
                    <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
                  ))}
                </select>
                <Smile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Journal Entry*
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Write your thoughts, memories, and stories here..."
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
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter a tag (e.g., family, memories)"
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
              className="mt-2 text-sm text-amber-600 hover:text-amber-800"
            >
              + Add Another Tag
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter image URL"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded"
                  disabled={formData.images.length <= 1 && index === 0 && !image}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddImage}
              className="mt-2 text-sm text-amber-600 hover:text-amber-800"
            >
              + Add Another Image
            </button>
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
              onClick={handleSaveEntry}
              icon={<Save size={16} />}
            >
              {isEditing ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Entry Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedEntry?.title || "Journal Entry"}
        maxWidth="2xl"
      >
        {selectedEntry && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-700">{formatDate(selectedEntry.date)}</span>
                {selectedEntry.mood && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    {selectedEntry.mood}
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
                    handleEditEntry(selectedEntry);
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
                    handleDeleteEntry(selectedEntry.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            {selectedEntry.images && selectedEntry.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedEntry.images.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img src={image} alt="Journal entry" className="w-full h-48 object-cover" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="prose max-w-none">
                {selectedEntry.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-gray-500" />
                <div className="flex flex-wrap gap-1">
                  {selectedEntry.tags.map((tag, index) => (
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
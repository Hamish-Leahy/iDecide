import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Play, 
  Pause, 
  Search, 
  Filter, 
  AlertCircle, 
  User, 
  Clock, 
  Save 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface VideoMessage {
  id: string;
  title: string;
  description?: string;
  date: string;
  url: string;
  thumbnail?: string;
  recipients?: string[];
  duration: string;
}

export function Videos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoMessage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    url: '',
    thumbnail: '',
    recipients: [''],
    duration: ''
  });

  // Common recipients
  const commonRecipients = [
    'Spouse', 'Son', 'Daughter', 'Grandchild', 'Friend', 'Sibling', 'Parent', 'All Family Members'
  ];

  useEffect(() => {
    const loadVideos = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load videos from database
        const { data, error } = await supabase
          .from('legacy_videos')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setVideos(data || []);
      } catch (err) {
        console.error('Error loading videos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    
    loadVideos();
  }, [user]);

  const handleAddVideo = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      url: '',
      thumbnail: '',
      recipients: [''],
      duration: ''
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleEditVideo = (video: VideoMessage) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      date: video.date,
      url: video.url,
      thumbnail: video.thumbnail || '',
      recipients: video.recipients || [''],
      duration: video.duration
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleViewVideo = (video: VideoMessage) => {
    setSelectedVideo(video);
    setShowViewModal(true);
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this video message? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('legacy_videos')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setVideos(videos.filter(video => video.id !== id));
      } catch (err) {
        console.error('Error deleting video:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete video');
      }
    }
  };

  const handleAddRecipient = () => {
    setFormData({
      ...formData,
      recipients: [...formData.recipients, '']
    });
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = [...formData.recipients];
    newRecipients.splice(index, 1);
    setFormData({
      ...formData,
      recipients: newRecipients
    });
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index] = value;
    setFormData({
      ...formData,
      recipients: newRecipients
    });
  };

  const handleSaveVideo = async () => {
    // Validate form
    if (!formData.title || !formData.url || !formData.date || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Filter out empty recipients
    const filteredRecipients = formData.recipients.filter(recipient => recipient.trim() !== '');
    
    try {
      if (isEditing && selectedVideo) {
        // Update existing video
        const { error } = await supabase
          .from('legacy_videos')
          .update({
            title: formData.title,
            description: formData.description || null,
            date: formData.date,
            url: formData.url,
            thumbnail: formData.thumbnail || null,
            recipients: filteredRecipients.length > 0 ? filteredRecipients : null,
            duration: formData.duration
          })
          .eq('id', selectedVideo.id);
          
        if (error) throw error;
        
        // Update local state
        setVideos(videos.map(video => 
          video.id === selectedVideo.id 
            ? {
                ...video,
                title: formData.title,
                description: formData.description || undefined,
                date: formData.date,
                url: formData.url,
                thumbnail: formData.thumbnail || undefined,
                recipients: filteredRecipients.length > 0 ? filteredRecipients : undefined,
                duration: formData.duration
              } 
            : video
        ));
      } else {
        // Add new video
        const { data, error } = await supabase
          .from('legacy_videos')
          .insert([{
            user_id: user?.id,
            title: formData.title,
            description: formData.description || null,
            date: formData.date,
            url: formData.url,
            thumbnail: formData.thumbnail || null,
            recipients: filteredRecipients.length > 0 ? filteredRecipients : null,
            duration: formData.duration
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        // Update local state
        if (data) {
          setVideos([data, ...videos]);
        }
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      setSelectedVideo(null);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error saving video:', err);
      setError(err instanceof Error ? err.message : 'Failed to save video');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter videos based on search query
  const filteredVideos = videos.filter(video => {
    const matchesSearch = 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.recipients && video.recipients.some(recipient => 
        recipient.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    return matchesSearch;
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
          <h1 className="text-2xl font-bold text-gray-900">Video Messages</h1>
          <p className="text-gray-600 mt-1">Record and store video messages for your loved ones</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddVideo}
          icon={<Plus size={20} />}
        >
          Add Video
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
          placeholder="Search videos..."
          className="flex-1"
        />
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Video Messages</h2>
          
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map(video => (
                <div 
                  key={video.id} 
                  className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewVideo(video)}
                >
                  <div className="relative h-40">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                        <Video className="text-purple-600" size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                        <Play className="text-purple-600 ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{video.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">Recorded: {formatDate(video.date)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVideo(video);
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 rounded"
                          title="Edit video"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete video"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {video.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{video.description}</p>
                    )}
                    {video.recipients && video.recipients.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <span>For:</span>
                        {video.recipients.map((recipient, index) => (
                          <span key={index} className="bg-gray-100 px-1.5 py-0.5 rounded">
                            {recipient}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No video messages found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? 'No videos match your search'
                  : 'Get started by adding your first video message'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={handleAddVideo}
                    icon={<Plus size={20} />}
                  >
                    Add Video
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Video Ideas */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Video Message Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Life Story</h3>
              <p className="text-sm text-gray-600 mb-3">
                Record your life story, important moments, and experiences.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    title: 'My Life Story',
                    description: 'Sharing the story of my life and important experiences'
                  });
                  setShowAddModal(true);
                }}
              >
                Start Recording
              </Button>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Special Occasions</h3>
              <p className="text-sm text-gray-600 mb-3">
                Create messages for future special occasions like weddings or graduations.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    title: 'For Your Special Day',
                    description: 'A message to be watched on a future special occasion'
                  });
                  setShowAddModal(true);
                }}
              >
                Start Recording
              </Button>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Family Traditions</h3>
              <p className="text-sm text-gray-600 mb-3">
                Document and explain family traditions, recipes, and customs.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    title: 'Our Family Traditions',
                    description: 'Explaining our family traditions and their importance'
                  });
                  setShowAddModal(true);
                }}
              >
                Start Recording
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Add/Edit Video Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isEditing ? "Edit Video Message" : "Add Video Message"}
        maxWidth="xl"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter a title for your video"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Describe what this video is about..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recording Date*
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration*
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 10:30"
                  required
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL*
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter the URL where the video is stored"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This could be a link to a cloud storage service, YouTube private video, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Image URL
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter an image URL for the video thumbnail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intended Recipients
            </label>
            {formData.recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => handleRecipientChange(index, e.target.value)}
                    className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Who is this video for?"
                    list="video-recipients"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <datalist id="video-recipients">
                    {commonRecipients.map(recipient => (
                      <option key={recipient} value={recipient} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(index)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded"
                  disabled={formData.recipients.length <= 1 && index === 0}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddRecipient}
              className="mt-2 text-sm text-purple-600 hover:text-purple-800"
            >
              + Add Another Recipient
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
              onClick={handleSaveVideo}
              icon={<Save size={16} />}
            >
              {isEditing ? 'Update Video' : 'Save Video'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Video Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setIsPlaying(false);
        }}
        title={selectedVideo?.title || "Video Message"}
        maxWidth="4xl"
      >
        {selectedVideo && (
          <div className="space-y-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {/* In a real app, this would be a video player component */}
              {selectedVideo.thumbnail ? (
                <img 
                  src={selectedVideo.thumbnail} 
                  alt={selectedVideo.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                  <Video className="text-purple-600" size={48} />
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center"
                >
                  {isPlaying ? 
                    <Pause className="text-purple-600" size={32} /> : 
                    <Play className="text-purple-600 ml-1" size={32} />
                  }
                </button>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{isPlaying ? '00:45' : '00:00'}</span>
                    <div className="w-48 md:w-96 h-1 bg-white bg-opacity-30 rounded-full">
                      <div 
                        className="h-1 bg-white rounded-full" 
                        style={{ width: isPlaying ? '5%' : '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm">{selectedVideo.duration}</span>
                  </div>
                  <div className="text-sm">HD</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-medium text-gray-900">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Recorded: {formatDate(selectedVideo.date)}</p>
                
                {selectedVideo.recipients && selectedVideo.recipients.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">For:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedVideo.recipients.map((recipient, index) => (
                        <span key={index} className="text-sm bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          {recipient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit size={14} />}
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditVideo(selectedVideo);
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
                    handleDeleteVideo(selectedVideo.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            {selectedVideo.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
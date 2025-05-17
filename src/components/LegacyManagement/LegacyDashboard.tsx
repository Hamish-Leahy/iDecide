import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Mail, 
  Video, 
  FileText, 
  BookMarked, 
  Calendar, 
  Heart, 
  ChevronRight,
  Clock,
  Edit,
  Star,
  Image,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
  images?: string[];
}

interface Letter {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  date: string;
  delivery_date?: string;
  status: 'draft' | 'scheduled' | 'delivered';
}

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

export function LegacyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentJournalEntries, setRecentJournalEntries] = useState<JournalEntry[]>([]);
  const [recentLetters, setRecentLetters] = useState<Letter[]>([]);
  const [recentVideos, setRecentVideos] = useState<VideoMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load journal entries from database
        const { data: journalData, error: journalError } = await supabase
          .from('legacy_journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(3);
          
        if (journalError) throw journalError;
        
        // Load letters from database
        const { data: lettersData, error: lettersError } = await supabase
          .from('legacy_letters')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(2);
          
        if (lettersError) throw lettersError;
        
        // Load videos from database
        const { data: videosData, error: videosError } = await supabase
          .from('legacy_videos')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(2);
          
        if (videosError) throw videosError;
        
        setRecentJournalEntries(journalData || []);
        setRecentLetters(lettersData || []);
        setRecentVideos(videosData || []);
      } catch (err) {
        console.error('Error loading legacy data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load legacy data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-6 border border-amber-100">
        <h1 className="text-2xl font-semibold mb-2">Legacy Dashboard</h1>
        <p className="text-gray-600">
          Preserve your memories, wisdom, and messages for your loved ones
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Legacy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <BookOpen className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Journal</h3>
              <p className="text-sm text-gray-500">{recentJournalEntries.length} entries recorded</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Latest Entry:</span>
              <span className="font-medium">{recentJournalEntries.length > 0 ? formatDate(recentJournalEntries[0].date) : 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Words:</span>
              <span className="font-medium">{recentJournalEntries.reduce((count, entry) => count + entry.content.split(' ').length, 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Photos:</span>
              <span className="font-medium">{recentJournalEntries.reduce((count, entry) => count + (entry.images?.length || 0), 0)}</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/legacy/journal')}
          >
            View Journal
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Letters</h3>
              <p className="text-sm text-gray-500">{recentLetters.length} letters written</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Drafts:</span>
              <span className="font-medium">{recentLetters.filter(letter => letter.status === 'draft').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Scheduled:</span>
              <span className="font-medium">{recentLetters.filter(letter => letter.status === 'scheduled').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivered:</span>
              <span className="font-medium">{recentLetters.filter(letter => letter.status === 'delivered').length}</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/legacy/letters')}
          >
            View Letters
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Video className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Video Messages</h3>
              <p className="text-sm text-gray-500">{recentVideos.length} videos recorded</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Duration:</span>
              <span className="font-medium">{recentVideos.length > 0 ? 'Various' : '0 minutes'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Latest Recording:</span>
              <span className="font-medium">{recentVideos.length > 0 ? formatDate(recentVideos[0].date) : 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Recipients:</span>
              <span className="font-medium">{recentVideos.length > 0 ? 'Various' : 'None'}</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/legacy/videos')}
          >
            View Videos
          </Button>
        </motion.div>
      </div>

      {/* Recent Journal Entries */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Journal Entries</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/legacy/journal')}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentJournalEntries.length > 0 ? (
              recentJournalEntries.map(entry => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
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
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit size={14} />}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">
                No journal entries yet
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/dashboard/legacy/journal')}
              icon={<Plus size={20} />}
            >
              Add New Journal Entry
            </Button>
          </div>
        </div>
      </Card>

      {/* Letters and Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letters */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Letters</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/legacy/letters')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentLetters.length > 0 ? (
                recentLetters.map(letter => (
                  <div key={letter.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{letter.subject}</p>
                          <p className="text-xs text-gray-500">To: {letter.recipient}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          letter.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          letter.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{letter.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">Created: {formatDate(letter.date)}</p>
                        {letter.delivery_date && (
                          <p className="text-xs text-gray-500">Delivery: {formatDate(letter.delivery_date)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  No letters yet
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard/legacy/letters')}
                icon={<Plus size={20} />}
              >
                Write a New Letter
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Videos */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Video Messages</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/legacy/videos')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentVideos.length > 0 ? (
                recentVideos.map(video => (
                  <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="relative h-32">
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
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900">{video.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Recorded: {formatDate(video.date)}</p>
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
                ))
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  No video messages yet
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard/legacy/videos')}
                icon={<Plus size={20} />}
              >
                Record New Video
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Memory Book Preview */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Memory Book</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/legacy/memorybook')}
            >
              View Book
            </Button>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <BookMarked className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Your Life Story</h3>
                <p className="text-gray-600 mt-1">
                  Your memory book compiles your journal entries, photos, and stories into a beautiful keepsake for your loved ones.
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div className="aspect-square rounded-md overflow-hidden bg-amber-100 flex items-center justify-center">
                    <Plus className="text-amber-600" size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard/legacy/memorybook')}
                  >
                    Start Building Memory Book
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
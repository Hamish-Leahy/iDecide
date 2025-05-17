import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Image as ImageIcon, 
  Save, 
  X, 
  Search, 
  Filter, 
  AlertCircle, 
  Download, 
  Share2, 
  Printer, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface MemoryBookPage {
  id: string;
  title: string;
  content: string;
  date: string;
  images?: string[];
  page_number: number;
  chapter: string;
}

interface MemoryBookChapter {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export function MemoryBook() {
  const { user } = useAuth();
  const [pages, setPages] = useState<MemoryBookPage[]>([]);
  const [chapters, setChapters] = useState<MemoryBookChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<MemoryBookPage | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  const [pageFormData, setPageFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    images: [''],
    chapter: ''
  });
  
  const [chapterFormData, setChapterFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const loadMemoryBook = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // In a real app, you would fetch from memory_book_chapters and memory_book_pages tables
        // For now, we'll use mock data
        
        // Mock chapters
        const mockChapters: MemoryBookChapter[] = [
          {
            id: 'childhood',
            title: 'Childhood & Early Years',
            description: 'Memories from childhood and formative experiences',
            order: 1
          },
          {
            id: 'family',
            title: 'Family Life',
            description: 'Stories about raising a family and family traditions',
            order: 2
          },
          {
            id: 'career',
            title: 'Career & Achievements',
            description: 'Professional journey and accomplishments',
            order: 3
          },
          {
            id: 'wisdom',
            title: 'Wisdom & Reflections',
            description: 'Life lessons and personal philosophy',
            order: 4
          }
        ];
        
        // Mock pages
        const mockPages: MemoryBookPage[] = [
          {
            id: '1',
            title: 'Growing Up in the Countryside',
            content: 'I grew up in a small farming community in the 1950s. Life was simpler then, but also filled with its own challenges. Our house was small but always full of love and laughter. My parents worked hard to provide for us, and they instilled in me the values of hard work, honesty, and perseverance.\n\nSome of my fondest memories are of helping my father in the fields during summer breaks from school. The work was hard, but there was something deeply satisfying about seeing the direct results of your labor. In the evenings, we would sit on the porch, listening to the radio or just talking about our day.\n\nSchool was a two-mile walk each way, and I still remember the adventures my siblings and I would have on those journeys. We\'d pick wildflowers in the spring, splash in puddles after rain, and build snowmen along the way in winter.\n\nThese early years shaped who I would become, teaching me to appreciate simple pleasures and find joy in everyday moments.',
            date: '2025-04-01',
            images: [
              'https://images.unsplash.com/photo-1516914589923-f105f1535f88?q=80&w=1470&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?q=80&w=1374&auto=format&fit=crop'
            ],
            page_number: 1,
            chapter: 'childhood'
          },
          {
            id: '2',
            title: 'School Days and First Friendships',
            content: 'My school days were filled with learning, friendships, and discovering my interests. I attended Oakridge Elementary, a small school where everyone knew each other. My favorite teacher was Mrs. Johnson, who taught fifth grade. She recognized my love for reading and always recommended books that challenged and inspired me.\n\nIt was during these years that I formed friendships that would last a lifetime. My best friend Sarah and I met on the first day of second grade when we both reached for the same crayon. Instead of arguing, we decided to share, and that set the tone for our friendship. We remained close throughout our lives, supporting each other through all of life\'s ups and downs.\n\nI discovered my love for science in middle school, thanks to an enthusiastic teacher who made experiments come alive. This early interest would later influence my career choices and lifelong curiosity about how things work.\n\nThese formative years taught me the value of education, not just for career preparation, but for expanding one\'s mind and understanding of the world.',
            date: '2025-04-02',
            images: [
              'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1422&auto=format&fit=crop'
            ],
            page_number: 2,
            chapter: 'childhood'
          },
          {
            id: '3',
            title: 'Meeting Your Father',
            content: 'I met your father in the spring of 1975 at a community dance. I wasn\'t planning to go that night, but my friend insisted, saying we needed a break from our studies. Little did I know that decision would change the course of my life.\n\nHe asked me to dance, and I was immediately struck by his kind eyes and genuine smile. We talked all evening, discovering shared interests in music, hiking, and a desire to travel. Our first date was a picnic in the park, where we talked for hours and lost track of time.\n\nWhat drew me to him was his combination of strength and gentleness, his quick wit, and his unwavering integrity. He was someone who always did the right thing, even when it wasn\'t easy.\n\nOur courtship wasn\'t without challenges - we lived in different cities for a while and had to navigate a long-distance relationship. But the foundation we built during that time, based on communication and trust, served us well throughout our marriage.\n\nWhen he proposed a year later, on the same hiking trail where we had our third date, I didn\'t hesitate to say yes. I knew I had found my partner for life.',
            date: '2025-04-03',
            images: [
              'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1470&auto=format&fit=crop'
            ],
            page_number: 3,
            chapter: 'family'
          },
          {
            id: '4',
            title: 'Early Years of Marriage',
            content: 'The early years of our marriage were both wonderful and challenging. We started with very little in terms of material possessions - a small apartment, secondhand furniture, and big dreams. But we were rich in love, determination, and shared vision for our future.\n\nWe learned to be a team, dividing household responsibilities and making financial decisions together. We discovered each other\'s habits - both endearing and annoying - and learned the art of compromise. There were disagreements, of course, but we established early on that we would never go to bed angry, a principle that served us well through decades of marriage.\n\nWe saved diligently for our first home, cutting expenses wherever possible and celebrating small victories along the way. When we finally moved into our first house, modest though it was, we felt immense pride and accomplishment.\n\nThese formative years of our marriage established patterns and traditions that would carry us through life together. We learned that material things mattered far less than mutual respect, shared laughter, and unwavering support for each other\'s dreams.',
            date: '2025-04-04',
            page_number: 4,
            chapter: 'family'
          },
          {
            id: '5',
            title: 'Becoming Parents',
            content: 'Becoming parents transformed our lives in ways we could never have imagined. When we held each of you for the first time, we experienced a love so profound and immediate that it took our breath away.\n\nThe early days were a blur of sleepless nights, diaper changes, and adjusting to our new reality. We made plenty of mistakes as we learned to be parents, but we approached each day with love and the determination to do our best for you.\n\nWatching you grow and develop your own personalities was one of life\'s greatest joys. Each milestone - first smiles, first steps, first words - filled us with wonder and pride. We tried to create a home filled with love, laughter, and the security of knowing you were cherished unconditionally.\n\nParenthood taught us patience, selflessness, and the ability to function on minimal sleep. It showed us strengths we didn\'t know we had and revealed new depths to our relationship as we partnered in this most important role.\n\nThough the years of active parenting have passed, being your parents remains our greatest privilege and the achievement we\'re most proud of in our lives.',
            date: '2025-04-05',
            images: [
              'https://images.unsplash.com/photo-1491013516836-7db643ee125a?q=80&w=1325&auto=format&fit=crop'
            ],
            page_number: 5,
            chapter: 'family'
          },
          {
            id: '6',
            title: 'My Career Journey',
            content: 'My career path wasn\'t always straightforward, but each step taught me valuable lessons and shaped who I became professionally. After college, I started as an entry-level research assistant at Johnson Laboratories. The pay was modest, but the opportunity to learn from brilliant scientists was invaluable.\n\nI still remember my first major project and the thrill of seeing my name on a published research paper. Those early years taught me the importance of curiosity, attention to detail, and perseverance through failed experiments and setbacks.\n\nThe turning point in my career came when I took a risk and joined a small startup developing new environmental technologies. Many thought I was crazy to leave the security of an established company, but I believed in the mission and saw the potential for impact. The next five years were intense - long hours, financial uncertainty, and tremendous growth both for the company and for me personally.\n\nWhen we were eventually acquired by a larger corporation, I faced another decision point. I chose to stay and help integrate our technologies, eventually rising to lead the entire research division. This phase taught me about leadership, organizational dynamics, and the delicate balance of maintaining innovation within a larger structure.\n\nLooking back, I\'m grateful for both the successes and the challenges. Each role contributed to a fulfilling career that allowed me to make a difference while supporting our family.',
            date: '2025-04-06',
            page_number: 6,
            chapter: 'career'
          },
          {
            id: '7',
            title: 'Professional Achievements',
            content: 'While I never sought recognition for its own sake, there were several professional achievements that brought me particular satisfaction. The environmental filtration system our team developed in 2005 has now been implemented in water treatment facilities across three continents, providing cleaner water for millions of people. Seeing the real-world impact of our work was profoundly rewarding.\n\nReceiving the Innovation in Sustainability Award in 2010 was an unexpected honor. I remember feeling somewhat uncomfortable in the spotlight, but deeply appreciative of the recognition for our team\'s work.\n\nPerhaps most meaningful was mentoring younger scientists and engineers throughout my career. Watching them develop their skills, confidence, and eventually make their own contributions to the field gave me a sense of continuity and purpose. Several have gone on to lead important research and development efforts of their own.\n\nI\'m also proud of the patents we secured and the papers we published, not for personal glory, but because they represented solutions to real problems and advancements in our understanding.\n\nThese achievements weren\'t accomplished in isolation. They were the result of collaboration, persistence through failures, and the support of colleagues who became friends over years of working toward shared goals.',
            date: '2025-04-07',
            page_number: 7,
            chapter: 'career'
          },
          {
            id: '8',
            title: 'Life Lessons I\'ve Learned',
            content: 'After decades of living, loving, working, and observing, these are some of the most important lessons I\'ve learned:\n\n1. Relationships matter most. At the end of life, no one wishes they had spent more time at the office or acquired more possessions. It\'s the connections with others that give life its deepest meaning.\n\n2. Change is the only constant. Learning to adapt with grace and resilience is one of life\'s most valuable skills. The most difficult changes often lead to unexpected growth and new opportunities.\n\n3. Worry is rarely productive. Most of what I worried about never happened, and the challenges that did arise were rarely those I had anticipated. Better to prepare reasonably for the future while fully living in the present.\n\n4. Kindness is never wasted. Small acts of compassion ripple outward in ways we may never see. Choose kindness whenever possible.\n\n5. Forgiveness liberates the forgiver more than the forgiven. Holding onto resentment only poisons one\'s own peace of mind.\n\n6. Learning is lifelong. Staying curious and open to new ideas keeps the mind young and life interesting, regardless of chronological age.\n\n7. Gratitude transforms ordinary days into thanksgiving. Appreciating what we have, rather than focusing on what\'s missing, is the surest path to contentment.\n\nI haven\'t always lived up to these ideals, but they\'ve served as a compass, helping me find my way back when I\'ve strayed from my best self.',
            date: '2025-04-08',
            page_number: 8,
            chapter: 'wisdom'
          },
          {
            id: '9',
            title: 'What I Hope You Remember',
            content: 'As I reflect on what I hope you\'ll remember about me after I\'m gone, it\'s not the achievements or accolades that matter most. Instead, I hope you\'ll remember:\n\nThe love I had for each of you - imperfect as its expression may sometimes have been, it was always constant and unconditional.\n\nThe values I tried to live by - honesty, compassion, perseverance, and gratitude. If I\'ve managed to pass these on to you, I\'ll consider my life well-lived.\n\nThe laughter we shared - from silly jokes at the dinner table to inside family references that no one else would understand.\n\nThe traditions we created together - holiday rituals, birthday celebrations, and the small daily habits that formed the fabric of our family life.\n\nThe support I tried to provide - believing in your dreams, encouraging you through challenges, and offering a safe harbor in life\'s storms.\n\nThe joy I found in simple pleasures - a beautiful sunset, a good book, a walk in nature, meaningful conversation. These are available to everyone, regardless of circumstance.\n\nMost of all, I hope you remember that you were the greatest blessing of my life, and that my love for you transcends time and space. It remains with you always, even when I cannot.',
            date: '2025-04-09',
            images: [
              'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1469&auto=format&fit=crop'
            ],
            page_number: 9,
            chapter: 'wisdom'
          }
        ];
        
        setChapters(mockChapters);
        setPages(mockPages);
      } catch (err) {
        console.error('Error loading memory book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load memory book');
      } finally {
        setLoading(false);
      }
    };
    
    loadMemoryBook();
  }, [user]);

  const handleAddPage = () => {
    setPageFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      images: [''],
      chapter: chapters.length > 0 ? chapters[0].id : ''
    });
    setIsEditing(false);
    setShowAddPageModal(true);
  };

  const handleAddChapter = () => {
    setChapterFormData({
      title: '',
      description: ''
    });
    setShowAddChapterModal(true);
  };

  const handleEditPage = (page: MemoryBookPage) => {
    setSelectedPage(page);
    setPageFormData({
      title: page.title,
      content: page.content,
      date: page.date,
      images: page.images || [''],
      chapter: page.chapter
    });
    setIsEditing(true);
    setShowAddPageModal(true);
  };

  const handleViewPage = (page: MemoryBookPage, index: number) => {
    setSelectedPage(page);
    setCurrentPageIndex(index);
    setShowViewModal(true);
  };

  const handleDeletePage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      setPages(pages.filter(page => page.id !== id));
    }
  };

  const handleAddImage = () => {
    setPageFormData({
      ...pageFormData,
      images: [...pageFormData.images, '']
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...pageFormData.images];
    newImages.splice(index, 1);
    setPageFormData({
      ...pageFormData,
      images: newImages
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...pageFormData.images];
    newImages[index] = value;
    setPageFormData({
      ...pageFormData,
      images: newImages
    });
  };

  const handleSavePage = () => {
    // Validate form
    if (!pageFormData.title || !pageFormData.content || !pageFormData.date || !pageFormData.chapter) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Filter out empty images
    const filteredImages = pageFormData.images.filter(image => image.trim() !== '');
    
    if (isEditing && selectedPage) {
      // Update existing page
      const updatedPage: MemoryBookPage = {
        ...selectedPage,
        title: pageFormData.title,
        content: pageFormData.content,
        date: pageFormData.date,
        images: filteredImages.length > 0 ? filteredImages : undefined,
        chapter: pageFormData.chapter
      };
      
      setPages(pages.map(page => 
        page.id === selectedPage.id ? updatedPage : page
      ));
    } else {
      // Add new page
      const newPage: MemoryBookPage = {
        id: Date.now().toString(),
        title: pageFormData.title,
        content: pageFormData.content,
        date: pageFormData.date,
        images: filteredImages.length > 0 ? filteredImages : undefined,
        page_number: pages.length + 1,
        chapter: pageFormData.chapter
      };
      
      setPages([...pages, newPage]);
    }
    
    // Close modal and reset form
    setShowAddPageModal(false);
    setSelectedPage(null);
    setIsEditing(false);
    setError(null);
  };

  const handleSaveChapter = () => {
    // Validate form
    if (!chapterFormData.title) {
      setError('Please enter a chapter title');
      return;
    }
    
    // Add new chapter
    const newChapter: MemoryBookChapter = {
      id: chapterFormData.title.toLowerCase().replace(/\s+/g, '_'),
      title: chapterFormData.title,
      description: chapterFormData.description || undefined,
      order: chapters.length + 1
    };
    
    setChapters([...chapters, newChapter]);
    
    // Close modal and reset form
    setShowAddChapterModal(false);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getChapterTitle = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.title : chapterId;
  };

  // Filter pages based on search query and selected chapter
  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChapter = selectedChapter === 'all' || page.chapter === selectedChapter;
    
    return matchesSearch && matchesChapter;
  }).sort((a, b) => a.page_number - b.page_number);

  // Get next and previous pages for the book view
  const getAdjacentPages = (currentIndex: number) => {
    const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number);
    const prevPage = currentIndex > 0 ? sortedPages[currentIndex - 1] : null;
    const nextPage = currentIndex < sortedPages.length - 1 ? sortedPages[currentIndex + 1] : null;
    return { prevPage, nextPage };
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Memory Book</h1>
          <p className="text-gray-600 mt-1">Compile your memories into a keepsake book for loved ones</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleAddChapter}
            icon={<Plus size={20} />}
          >
            Add Chapter
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPage}
            icon={<Plus size={20} />}
          >
            Add Page
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Book Cover */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Your Memory Book</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer size={16} />}
              >
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={16} />}
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Share2 size={16} />}
              >
                Share
              </Button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <BookMarked className="mx-auto text-amber-700 mb-6" size={48} />
              <h1 className="text-3xl font-bold text-amber-900 mb-2">My Life Story</h1>
              <p className="text-lg text-amber-800 mb-4">A Collection of Memories and Wisdom</p>
              <p className="text-amber-700 italic">By {user?.email?.split('@')[0] || 'Me'}</p>
              
              <div className="mt-8 text-sm text-amber-800">
                <p>Created with love for my family</p>
                <p>{new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-4">
          <Card>
            <div className="p-4">
              <h2 className="font-medium text-gray-900 mb-3">Table of Contents</h2>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedChapter('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedChapter === 'all' ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100'
                  }`}
                >
                  All Pages
                </button>
                {chapters.map(chapter => (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapter(chapter.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedChapter === chapter.id ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    {chapter.title}
                  </button>
                ))}
              </div>
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddChapter}
                  icon={<Plus size={16} />}
                >
                  Add Chapter
                </Button>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <h2 className="font-medium text-gray-900 mb-3">Book Stats</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pages:</span>
                  <span className="font-medium">{pages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chapters:</span>
                  <span className="font-medium">{chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images:</span>
                  <span className="font-medium">
                    {pages.reduce((count, page) => count + (page.images?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {pages.length > 0 
                      ? formatDate(pages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)
                      : 'N/A'
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
                <h2 className="text-lg font-semibold">
                  {selectedChapter === 'all' 
                    ? 'All Pages' 
                    : `Chapter: ${getChapterTitle(selectedChapter)}`
                  }
                </h2>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search pages..."
                  className="w-48 md:w-64"
                />
              </div>
              
              {filteredPages.length > 0 ? (
                <div className="space-y-4">
                  {filteredPages.map((page, index) => (
                    <div 
                      key={page.id} 
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleViewPage(page, index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0 mt-1">
                            <BookMarked className="text-amber-600" size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                Page {page.page_number}
                              </span>
                              <h3 className="font-medium text-gray-900">{page.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Chapter: {getChapterTitle(page.chapter)} • {formatDate(page.date)}
                            </p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{page.content}</p>
                            
                            {page.images && page.images.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {page.images.map((image, index) => (
                                  <div key={index} className="w-16 h-16 rounded-md overflow-hidden">
                                    <img src={image} alt="Memory" className="w-full h-full object-cover" />
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
                              handleEditPage(page);
                            }}
                            className="p-2 text-gray-400 hover:text-amber-600 rounded-full hover:bg-amber-50"
                            title="Edit page"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                            title="Delete page"
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
                  <BookMarked className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pages found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedChapter !== 'all'
                      ? 'No pages match your search or filter'
                      : 'Get started by adding your first memory book page'}
                  </p>
                  {!searchQuery && (
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={handleAddPage}
                        icon={<Plus size={20} />}
                      >
                        Add Page
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Page Modal */}
      <Modal
        isOpen={showAddPageModal}
        onClose={() => setShowAddPageModal(false)}
        title={isEditing ? "Edit Memory Book Page" : "Add Memory Book Page"}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Title*
            </label>
            <input
              type="text"
              value={pageFormData.title}
              onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Enter a title for this page"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapter*
              </label>
              <select
                value={pageFormData.chapter}
                onChange={(e) => setPageFormData({ ...pageFormData, chapter: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select a chapter</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
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
                  value={pageFormData.date}
                  onChange={(e) => setPageFormData({ ...pageFormData, date: e.target.value })}
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content*
            </label>
            <textarea
              value={pageFormData.content}
              onChange={(e) => setPageFormData({ ...pageFormData, content: e.target.value })}
              rows={8}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Write your memory or story here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            {pageFormData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter image URL"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded"
                  disabled={pageFormData.images.length <= 1 && index === 0 && !image}
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
              onClick={() => setShowAddPageModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePage}
              icon={<Save size={16} />}
            >
              {isEditing ? 'Update Page' : 'Add to Book'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Chapter Modal */}
      <Modal
        isOpen={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        title="Add New Chapter"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Title*
            </label>
            <input
              type="text"
              value={chapterFormData.title}
              onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Enter a title for this chapter"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={chapterFormData.description}
              onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Describe what this chapter covers..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddChapterModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveChapter}
              icon={<Save size={16} />}
            >
              Add Chapter
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Page Modal (Book View) */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Memory Book"
        maxWidth="4xl"
      >
        {selectedPage && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Page {selectedPage.page_number}
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  {getChapterTitle(selectedPage.chapter)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit size={14} />}
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditPage(selectedPage);
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
                    handleDeletePage(selectedPage.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-8 border border-amber-100">
              <h1 className="text-2xl font-bold text-amber-900 mb-4 text-center">{selectedPage.title}</h1>
              
              {selectedPage.images && selectedPage.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPage.images.map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        <img src={image} alt="Memory" className="w-full h-48 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="prose max-w-none">
                {selectedPage.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
              
              <div className="text-right mt-6 text-sm text-amber-700">
                {formatDate(selectedPage.date)}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              {getAdjacentPages(currentPageIndex).prevPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ChevronLeft size={16} />}
                  onClick={() => {
                    const prevIndex = currentPageIndex - 1;
                    if (prevIndex >= 0) {
                      const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number);
                      setSelectedPage(sortedPages[prevIndex]);
                      setCurrentPageIndex(prevIndex);
                    }
                  }}
                >
                  Previous Page
                </Button>
              ) : (
                <div></div>
              )}
              
              {getAdjacentPages(currentPageIndex).nextPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextIndex = currentPageIndex + 1;
                    const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number);
                    if (nextIndex < sortedPages.length) {
                      setSelectedPage(sortedPages[nextIndex]);
                      setCurrentPageIndex(nextIndex);
                    }
                  }}
                >
                  Next Page
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
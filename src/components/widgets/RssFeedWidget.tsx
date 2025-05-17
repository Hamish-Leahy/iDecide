import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card } from '../common/Card';

interface Article {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail?: string;
}

interface RssFeedWidgetProps {
  className?: string;
}

export function RssFeedWidget({ className = '' }: RssFeedWidgetProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const articlesPerPage = 3;
  
  useEffect(() => {
    const fetchRssFeed = async () => {
      try {
        setLoading(true);
        
        // Use a CORS proxy to fetch the RSS feed
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.idecide.co/blog-2-1/rss.xml'));
        
        if (!response.ok) {
          throw new Error('Failed to fetch RSS feed');
        }
        
        const data = await response.json();
        
        if (!data.contents) {
          throw new Error('Invalid RSS feed data');
        }
        
        // Parse the XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        // Extract articles
        const items = xmlDoc.querySelectorAll('item');
        const parsedArticles: Article[] = [];
        
        items.forEach(item => {
          // Get the description element
          const descriptionElement = item.querySelector('description');
          let description = descriptionElement ? descriptionElement.textContent || '' : '';
          let thumbnail = undefined;
          
          // Try to extract thumbnail from description (if it contains HTML with an image)
          if (description) {
            const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) {
              thumbnail = imgMatch[1];
            }
            
            // Clean up description (remove HTML tags)
            description = description.replace(/<[^>]*>/g, '').trim();
            
            // Truncate description
            if (description.length > 150) {
              description = description.substring(0, 150) + '...';
            }
          }
          
          parsedArticles.push({
            title: item.querySelector('title')?.textContent || 'Untitled',
            link: item.querySelector('link')?.textContent || '#',
            pubDate: item.querySelector('pubDate')?.textContent || '',
            description,
            thumbnail
          });
        });
        
        setArticles(parsedArticles);
      } catch (err) {
        console.error('Error fetching RSS feed:', err);
        setError('Failed to load blog articles');
        
        // Set some mock data for demonstration
        setArticles([
          {
            title: 'Planning for the Unexpected: Why Digital Estate Planning Matters',
            link: 'https://www.idecide.co/blog-2-1/planning-for-the-unexpected',
            pubDate: 'Mon, 15 Apr 2025 12:00:00 GMT',
            description: 'In today&#39;s digital age, our online presence extends far beyond social media. From banking and investments to subscriptions and digital assets, our lives are increasingly digital...',
            thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
          },
          {
            title: 'Protecting Your Digital Legacy: A Step-by-Step Guide',
            link: 'https://www.idecide.co/blog-2-1/protecting-your-digital-legacy',
            pubDate: 'Wed, 10 Apr 2025 10:30:00 GMT',
            description: 'Have you ever thought about what happens to your digital accounts, assets, and information when you&#39;re no longer around? Most people haven&#39;t, but it&#39;s becoming increasingly important...',
            thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
          },
          {
            title: 'The Importance of Password Management in Estate Planning',
            link: 'https://www.idecide.co/blog-2-1/password-management-estate-planning',
            pubDate: 'Fri, 05 Apr 2025 14:15:00 GMT',
            description: 'Passwords are the keys to our digital kingdom. From banking and investment accounts to social media profiles and email, passwords protect our most sensitive information...',
            thumbnail: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
          },
          {
            title: 'How to Talk to Your Family About Digital Estate Planning',
            link: 'https://www.idecide.co/blog-2-1/family-digital-estate-planning',
            pubDate: 'Mon, 01 Apr 2025 09:45:00 GMT',
            description: 'Discussing end-of-life planning with family members can be uncomfortable, but it&#39;s a necessary conversation. In the digital age, this discussion needs to include your digital assets and accounts...',
            thumbnail: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
          },
          {
            title: 'Legal Aspects of Digital Estate Planning: What You Need to Know',
            link: 'https://www.idecide.co/blog-2-1/legal-aspects-digital-estate',
            pubDate: 'Fri, 28 Mar 2025 11:20:00 GMT',
            description: 'The legal landscape surrounding digital assets is complex and evolving. Many people assume that their executor or power of attorney will automatically have access to their digital accounts...',
            thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRssFeed();
  }, []);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const currentArticles = articles.slice(
    currentPage * articlesPerPage, 
    (currentPage + 1) * articlesPerPage
  );
  
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Newspaper size={20} className="text-[#1E1B4B]" />
            iDecide Blog
          </h3>
          <a 
            href="https://www.idecide.co/blog-2-1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-[#1E1B4B] hover:text-[#2D2A6A] flex items-center gap-1"
          >
            View All Articles
            <ExternalLink size={14} />
          </a>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-1/3 h-32 bg-gray-200 rounded-lg"></div>
                <div className="w-2/3 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-[#1E1B4B] hover:text-[#2D2A6A]"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentArticles.map((article, index) => (
                <a 
                  key={index} 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex gap-4 group hover:bg-[#F5F8F7] p-3 rounded-lg transition-colors"
                >
                  {article.thumbnail ? (
                    <div className="w-1/3 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={article.thumbnail} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-1/3 h-32 bg-[#E5EDEB] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Newspaper size={32} className="text-[#1E1B4B]" />
                    </div>
                  )}
                  <div className="w-2/3">
                    <h4 className="font-medium text-gray-900 group-hover:text-[#1E1B4B] transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(article.pubDate)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {article.description}
                    </p>
                    <span className="text-xs text-[#1E1B4B] mt-2 inline-flex items-center gap-1 group-hover:underline">
                      Read More
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-1 text-sm ${
                    currentPage === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-[#1E1B4B] hover:text-[#2D2A6A]'
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="text-sm text-gray-500">
                  Page {currentPage + 1} of {totalPages}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= totalPages - 1}
                  className={`flex items-center gap-1 text-sm ${
                    currentPage >= totalPages - 1
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-[#1E1B4B] hover:text-[#2D2A6A]'
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
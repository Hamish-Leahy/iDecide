import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  last_reviewed: string;
  next_review?: string;
}

interface ImportantDocumentsWidgetProps {
  className?: string;
}

export function ImportantDocumentsWidget({ className = '' }: ImportantDocumentsWidgetProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDocuments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('legal_documents')
          .select('id, title, type, status, last_reviewed, next_review')
          .eq('user_id', user.id)
          .order('next_review', { ascending: true, nullsLast: true })
          .limit(5);
          
        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [user]);
  
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'will':
        return <FileText size={14} className="text-blue-500" />;
      case 'poa':
        return <FileText size={14} className="text-purple-500" />;
      case 'trust':
        return <FileText size={14} className="text-green-500" />;
      case 'directive':
        return <FileText size={14} className="text-amber-500" />;
      default:
        return <FileText size={14} className="text-gray-500" />;
    }
  };
  
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'will': return 'Will';
      case 'poa': return 'Power of Attorney';
      case 'trust': return 'Trust';
      case 'directive': return 'Advance Directive';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center gap-0.5">
            <CheckCircle size={10} />
            <span>Active</span>
          </span>
        );
      case 'draft':
        return (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-0.5">
            <Clock size={10} />
            <span>Draft</span>
          </span>
        );
      case 'needs_review':
        return (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
            <AlertCircle size={10} />
            <span>Review</span>
          </span>
        );
      default:
        return (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  const formatReviewDate = (dateString?: string) => {
    if (!dateString) return 'No review scheduled';
    
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 30) {
      return `In ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText size={18} className="text-[#1E1B4B]" />
            Important Documents
          </h3>
          <a 
            href="/dashboard/legal" 
            className="text-xs text-[#1E1B4B] hover:text-[#2D2A6A]"
          >
            View All
          </a>
        </div>
        
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            documents.map(document => (
              <div 
                key={document.id}
                className="p-3 rounded-lg bg-[#F5F8F7] hover:bg-[#E5EDEB] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg flex-shrink-0 mt-0.5">
                      {getDocumentTypeIcon(document.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {document.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {getDocumentTypeLabel(document.type)}
                        </span>
                        {getStatusBadge(document.status)}
                      </div>
                      {document.next_review && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>Next review: {formatReviewDate(document.next_review)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <a 
                    href={`/dashboard/legal/${document.type === 'will' || document.type === 'trust' ? 'wills' : 
                           document.type === 'poa' ? 'poa' : 
                           document.type === 'directive' ? 'directives' : 
                           'documents'}`}
                    className="text-[#1E1B4B] hover:text-[#2D2A6A]"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              <p>No documents found</p>
              <a 
                href="/dashboard/legal/wills" 
                className="mt-2 inline-block text-[#1E1B4B] hover:text-[#2D2A6A]"
              >
                Create your first document
              </a>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>Documents should be reviewed annually</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
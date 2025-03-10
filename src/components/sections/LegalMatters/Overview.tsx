import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileText, History, ChevronDown, ChevronUp, AlertTriangle, Clock } from 'lucide-react';
import { useLegalChangesStore } from '../../../store/legalChangesStore';
import { useLegalDocumentsStore } from '../../../store/legalDocumentsStore';
import { Link } from 'react-router-dom';

const Overview = () => {
  const { changes } = useLegalChangesStore();
  const { 
    documents, 
    getUpcomingReviews,
    fetchDocuments,
    completeTask,
    updateDocument
  } = useLegalDocumentsStore();
  const [showAllChanges, setShowAllChanges] = useState(false);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDocuments();
      const reviews = await getUpcomingReviews();
      setUpcomingReviews(reviews);
      setLoading(false);
    };
    loadData();
  }, []);

  // Get the 3 most recent changes
  const recentChanges = changes.slice(0, 3);
  // Get remaining changes
  const remainingChanges = changes.slice(3);
  const hasMoreChanges = remainingChanges.length > 0;

  // Calculate document statistics
  const documentStats = {
    total: documents.length,
    needsReview: documents.filter(doc => doc.status === 'needs_review').length,
    active: documents.filter(doc => doc.status === 'active').length,
    expired: documents.filter(doc => {
      if (!doc.metadata?.expiryDate) return false;
      return new Date(doc.metadata.expiryDate) < new Date();
    }).length
  };

  // Get documents needing attention
  const documentsNeedingAttention = documents
    .filter(doc => {
      if (doc.status === 'needs_review') return true;
      if (doc.metadata?.expiryDate && new Date(doc.metadata.expiryDate) < new Date()) return true;
      return false;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      await fetchDocuments(); // Refresh documents after task completion
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5959]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Legal Matters Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#B5D3D3] p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Will & Testament</h3>
          <p className="mb-2">
            Last updated: {
              documents.find(d => d.documentType === 'will')?.updatedAt
                ? format(new Date(documents.find(d => d.documentType === 'will')!.updatedAt), 'MMM d, yyyy')
                : 'Not created'
            }
          </p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            documents.find(d => d.documentType === 'will')?.status === 'active'
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}>
            {documents.find(d => d.documentType === 'will')?.status === 'active' ? 'Up to date' : 'Needs review'}
          </span>
        </div>

        <div className="bg-[#B5D3D3] p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Power of Attorney</h3>
          <p className="mb-2">
            Last updated: {
              documents.find(d => d.documentType === 'power-of-attorney')?.updatedAt
                ? format(new Date(documents.find(d => d.documentType === 'power-of-attorney')!.updatedAt), 'MMM d, yyyy')
                : 'Not created'
            }
          </p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            documents.find(d => d.documentType === 'power-of-attorney')?.status === 'active'
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}>
            {documents.find(d => d.documentType === 'power-of-attorney')?.status === 'active' ? 'Up to date' : 'Needs review'}
          </span>
        </div>

        <div className="bg-[#B5D3D3] p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Healthcare Directive</h3>
          <p className="mb-2">
            Last updated: {
              documents.find(d => d.documentType === 'healthcare-directive')?.updatedAt
                ? format(new Date(documents.find(d => d.documentType === 'healthcare-directive')!.updatedAt), 'MMM d, yyyy')
                : 'Not created'
            }
          </p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            documents.find(d => d.documentType === 'healthcare-directive')?.status === 'active'
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}>
            {documents.find(d => d.documentType === 'healthcare-directive')?.status === 'active' ? 'Up to date' : 'Needs review'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#B5D3D3] rounded-lg">
              <History className="w-6 h-6 text-[#2D5959]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Recent Changes</h3>
              <p className="text-gray-600">History of document updates and modifications</p>
            </div>
          </div>
          {hasMoreChanges && (
            <button
              onClick={() => setShowAllChanges(!showAllChanges)}
              className="flex items-center gap-2 text-[#2D5959] hover:text-[#85B1B1] transition-colors"
            >
              {showAllChanges ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show All <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Recent Changes */}
          {recentChanges.map((change) => (
            <div
              key={change.id}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-[#B5D3D3] bg-opacity-50 rounded-lg">
                <FileText className="w-4 h-4 text-[#2D5959]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{change.section}</h4>
                  <span className="text-sm text-gray-500">
                    {format(new Date(change.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-gray-600">{change.action}</p>
                <p className="text-sm text-gray-500 mt-1">{change.details}</p>
              </div>
            </div>
          ))}

          {/* Expandable Changes */}
          {showAllChanges && remainingChanges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {remainingChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4 last:mb-0"
                >
                  <div className="p-2 bg-[#B5D3D3] bg-opacity-50 rounded-lg">
                    <FileText className="w-4 h-4 text-[#2D5959]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{change.section}</h4>
                      <span className="text-sm text-gray-500">
                        {format(new Date(change.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-600">{change.action}</p>
                    <p className="text-sm text-gray-500 mt-1">{change.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Action Items</h3>
        {documentsNeedingAttention.map(doc => (
          <Link 
            key={doc.id}
            to={`/legal/${doc.documentType.toLowerCase()}`}
            className="block bg-[#B5D3D3] p-4 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <div className="flex items-center gap-2 text-[#2D5959]">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {doc.status === 'needs_review' 
                  ? `Review ${doc.title}`
                  : `Update expired ${doc.title}`
                }
              </span>
            </div>
            {doc.metadata?.expiryDate && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(doc.metadata.expiryDate) < new Date()
                  ? `Expired ${format(new Date(doc.metadata.expiryDate), 'MMM d, yyyy')}`
                  : `Expires ${format(new Date(doc.metadata.expiryDate), 'MMM d, yyyy')}`
                }
              </p>
            )}
          </Link>
        ))}

        {upcomingReviews.map(review => (
          <div key={review.id} className="bg-[#B5D3D3] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-[#2D5959]">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                Scheduled review for {review.legal_documents.title}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Due {format(new Date(review.review_date), 'MMM d, yyyy')}
            </p>
          </div>
        ))}

        {documentsNeedingAttention.length === 0 && upcomingReviews.length === 0 && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>All documents are up to date!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
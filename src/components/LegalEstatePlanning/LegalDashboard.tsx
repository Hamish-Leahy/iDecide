import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertCircle, FileText, Users, Briefcase, CheckCircle, ScrollText, UserCog, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface LegalDocument {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'active' | 'expired' | 'needs_review';
  last_reviewed: string;
  next_review: string;
}

interface InsurancePolicy {
  id: string;
  type: string;
  provider: string;
  status: string;
  renewal_date: string;
}

interface LegalContact {
  id: string;
  name: string;
  role: string;
}

export function LegalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [contacts, setContacts] = useState<LegalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [documentsResponse, policiesResponse, contactsResponse] = await Promise.all([
        supabase
          .from('legal_documents')
          .select('*')
          .eq('user_id', user?.id),
        supabase
          .from('insurance_policies')
          .select('*')
          .eq('user_id', user?.id),
        supabase
          .from('legal_contacts')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (documentsResponse.error) throw documentsResponse.error;
      if (policiesResponse.error) throw policiesResponse.error;
      if (contactsResponse.error) throw contactsResponse.error;

      setDocuments(documentsResponse.data || []);
      setPolicies(policiesResponse.data || []);
      setContacts(contactsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const documentsByType = documents.reduce((acc, doc) => {
    acc[doc.type] = acc[doc.type] || [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, LegalDocument[]>);

  const getDocumentStatusCount = (status: string) => {
    return documents.filter(doc => doc.status === status).length;
  };

  const getUpcomingReviews = () => {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);
    
    return documents
      .filter(doc => {
        const reviewDate = new Date(doc.next_review);
        return reviewDate > now && reviewDate < threeMonthsFromNow;
      })
      .sort((a, b) => new Date(a.next_review).getTime() - new Date(b.next_review).getTime());
  };

  const handleCreateWill = () => {
    navigate('/dashboard/legal/wills');
  };

  const handleSetupPOA = () => {
    navigate('/dashboard/legal/poa');
  };

  const handleLegalReview = () => {
    navigate('/dashboard/legal/checklist');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your legal documents and estate planning</p>
        </div>
        <Button
          variant="primary"
          icon={<FileText size={20} />}
          onClick={() => navigate('/dashboard/legal/wills')}
        >
          Create Document
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Document Status */}
        <Card className="col-span-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Document Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium">Active</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {getDocumentStatusCount('active')}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-amber-600" size={20} />
                  <span className="font-medium">Needs Review</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {getDocumentStatusCount('needs_review')}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-blue-600" size={20} />
                  <span className="font-medium">Draft</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {getDocumentStatusCount('draft')}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-red-600" size={20} />
                  <span className="font-medium">Expired</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {getDocumentStatusCount('expired')}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Documents */}
        <Card className="col-span-full lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>
            <div className="space-y-4">
              {documents.length > 0 ? (
                documents.slice(0, 5).map(doc => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {doc.type === 'will' && <ScrollText className="text-blue-600" size={20} />}
                      {doc.type === 'poa' && <UserCog className="text-purple-600" size={20} />}
                      {doc.type === 'trust' && <Briefcase className="text-emerald-600" size={20} />}
                      {doc.type === 'directive' && <Heart className="text-rose-600" size={20} />}
                      {!['will', 'poa', 'trust', 'directive'].includes(doc.type) && <FileText className="text-gray-600" size={20} />}
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500">Last reviewed: {new Date(doc.last_reviewed).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${doc.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                      ${doc.status === 'needs_review' ? 'bg-amber-100 text-amber-700' : ''}
                      ${doc.status === 'draft' ? 'bg-blue-100 text-blue-700' : ''}
                      ${doc.status === 'expired' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {doc.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No documents created yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/dashboard/legal/wills')}
                  >
                    Create Your First Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Upcoming Reviews */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Reviews</h2>
            <div className="space-y-4">
              {getUpcomingReviews().length > 0 ? (
                getUpcomingReviews().slice(0, 3).map(doc => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(doc.next_review).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (doc.type === 'will') navigate('/dashboard/legal/wills');
                        else if (doc.type === 'poa') navigate('/dashboard/legal/poa');
                        else if (doc.type === 'trust') navigate('/dashboard/legal/wills');
                        else if (doc.type === 'directive') navigate('/dashboard/legal/directives');
                        else navigate('/dashboard/legal');
                      }}
                    >
                      Review
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No upcoming reviews</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleCreateWill}
            >
              <ScrollText size={20} className="mr-2" />
              Create Will
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleSetupPOA}
            >
              <UserCog size={20} className="mr-2" />
              Set Up POA
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLegalReview}
            >
              <Scale size={20} className="mr-2" />
              Legal Review
            </Button>
          </div>
        </div>
      </Card>

      {/* Legal Status Overview */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Legal Document Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Will</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  documentsByType['will']?.some(doc => doc.status === 'active')
                    ? 'bg-green-100 text-green-700'
                    : documentsByType['will']?.some(doc => doc.status === 'draft')
                    ? 'bg-blue-100 text-blue-700'
                    : documentsByType['will']?.some(doc => doc.status === 'needs_review')
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {documentsByType['will']?.some(doc => doc.status === 'active')
                    ? 'Up to Date'
                    : documentsByType['will']?.some(doc => doc.status === 'draft')
                    ? 'In Progress'
                    : documentsByType['will']?.some(doc => doc.status === 'needs_review')
                    ? 'Needs Review'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Power of Attorney</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  documentsByType['poa']?.some(doc => doc.status === 'active')
                    ? 'bg-green-100 text-green-700'
                    : documentsByType['poa']?.some(doc => doc.status === 'draft')
                    ? 'bg-blue-100 text-blue-700'
                    : documentsByType['poa']?.some(doc => doc.status === 'needs_review')
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {documentsByType['poa']?.some(doc => doc.status === 'active')
                    ? 'Up to Date'
                    : documentsByType['poa']?.some(doc => doc.status === 'draft')
                    ? 'In Progress'
                    : documentsByType['poa']?.some(doc => doc.status === 'needs_review')
                    ? 'Needs Review'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Living Trust</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  documentsByType['trust']?.some(doc => doc.status === 'active')
                    ? 'bg-green-100 text-green-700'
                    : documentsByType['trust']?.some(doc => doc.status === 'draft')
                    ? 'bg-blue-100 text-blue-700'
                    : documentsByType['trust']?.some(doc => doc.status === 'needs_review')
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {documentsByType['trust']?.some(doc => doc.status === 'active')
                    ? 'Up to Date'
                    : documentsByType['trust']?.some(doc => doc.status === 'draft')
                    ? 'In Progress'
                    : documentsByType['trust']?.some(doc => doc.status === 'needs_review')
                    ? 'Needs Review'
                    : 'Not Started'}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Healthcare Directive</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  documentsByType['directive']?.some(doc => doc.status === 'active')
                    ? 'bg-green-100 text-green-700'
                    : documentsByType['directive']?.some(doc => doc.status === 'draft')
                    ? 'bg-blue-100 text-blue-700'
                    : documentsByType['directive']?.some(doc => doc.status === 'needs_review')
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {documentsByType['directive']?.some(doc => doc.status === 'active')
                    ? 'Up to Date'
                    : documentsByType['directive']?.some(doc => doc.status === 'draft')
                    ? 'In Progress'
                    : documentsByType['directive']?.some(doc => doc.status === 'needs_review')
                    ? 'Needs Review'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Life Insurance</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  policies.some(p => p.type === 'life' && p.status === 'active')
                    ? 'bg-green-100 text-green-700'
                    : policies.some(p => p.type === 'life' && p.status === 'pending')
                    ? 'bg-blue-100 text-blue-700'
                    : policies.some(p => p.type === 'life')
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {policies.some(p => p.type === 'life' && p.status === 'active')
                    ? 'Up to Date'
                    : policies.some(p => p.type === 'life' && p.status === 'pending')
                    ? 'In Progress'
                    : policies.some(p => p.type === 'life')
                    ? 'Needs Review'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estate Plan</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  documents.length > 3 && policies.length > 1 && contacts.length > 0
                    ? 'bg-green-100 text-green-700'
                    : documents.length > 0 || policies.length > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {documents.length > 3 && policies.length > 1 && contacts.length > 0
                    ? 'Up to Date'
                    : documents.length > 0 || policies.length > 0
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
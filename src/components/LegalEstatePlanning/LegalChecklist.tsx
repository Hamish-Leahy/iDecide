import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface LegalDocument {
  id: string;
  type: string;
  status: string;
}

interface InsurancePolicy {
  id: string;
  type: string;
  status: string;
}

export function LegalChecklist() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
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
      const [documentsResponse, policiesResponse] = await Promise.all([
        supabase
          .from('legal_documents')
          .select('id, type, status')
          .eq('user_id', user?.id),
        supabase
          .from('insurance_policies')
          .select('id, type, status')
          .eq('user_id', user?.id)
      ]);

      if (documentsResponse.error) throw documentsResponse.error;
      if (policiesResponse.error) throw policiesResponse.error;

      setDocuments(documentsResponse.data || []);
      setPolicies(policiesResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.type === type);
    if (!doc) return 'not_started';
    return doc.status;
  };

  const getPolicyStatus = (type: string) => {
    const policy = policies.find(p => p.type === type);
    if (!policy) return 'not_started';
    return policy.status;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle2 className="text-green-500" size={20} />;
    if (status === 'draft' || status === 'pending') return <Scale className="text-amber-500" size={20} />;
    if (status === 'needs_review') return <Scale className="text-amber-500" size={20} />;
    return <Scale className="text-gray-400" size={20} />;
  };

  const getStatusText = (status: string) => {
    if (status === 'active') return 'Completed';
    if (status === 'draft') return 'In Progress';
    if (status === 'pending') return 'In Progress';
    if (status === 'needs_review') return 'Needs Review';
    return 'Not Started';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Checklist</h1>
          <p className="text-gray-600 mt-1">Track your legal document completion status</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6">Essential Documents</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getDocumentStatus('will'))}
                <span className="text-gray-900">Last Will and Testament</span>
              </div>
              <span className={`text-sm font-medium ${
                getDocumentStatus('will') === 'active' ? 'text-green-600' :
                getDocumentStatus('will') === 'draft' ? 'text-amber-600' :
                getDocumentStatus('will') === 'needs_review' ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {getStatusText(getDocumentStatus('will'))}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getDocumentStatus('trust'))}
                <span className="text-gray-900">Living Trust</span>
              </div>
              <span className={`text-sm font-medium ${
                getDocumentStatus('trust') === 'active' ? 'text-green-600' :
                getDocumentStatus('trust') === 'draft' ? 'text-amber-600' :
                getDocumentStatus('trust') === 'needs_review' ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {getStatusText(getDocumentStatus('trust'))}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getDocumentStatus('poa'))}
                <span className="text-gray-900">Power of Attorney</span>
              </div>
              <span className={`text-sm font-medium ${
                getDocumentStatus('poa') === 'active' ? 'text-green-600' :
                getDocumentStatus('poa') === 'draft' ? 'text-amber-600' :
                getDocumentStatus('poa') === 'needs_review' ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {getStatusText(getDocumentStatus('poa'))}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getDocumentStatus('directive'))}
                <span className="text-gray-900">Healthcare Directive</span>
              </div>
              <span className={`text-sm font-medium ${
                getDocumentStatus('directive') === 'active' ? 'text-green-600' :
                getDocumentStatus('directive') === 'draft' ? 'text-amber-600' :
                getDocumentStatus('directive') === 'needs_review' ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {getStatusText(getDocumentStatus('directive'))}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getPolicyStatus('life'))}
                <span className="text-gray-900">Life Insurance Policy</span>
              </div>
              <span className={`text-sm font-medium ${
                getPolicyStatus('life') === 'active' ? 'text-green-600' :
                getPolicyStatus('life') === 'pending' ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {getStatusText(getPolicyStatus('life'))}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(getPolicyStatus('disability'))}
                <span className="text-gray-900">Disability Insurance</span>
              </div>
              <span className={`text-sm font-medium ${
                getPolicyStatus('disability') === 'active' ? 'text-green-600' :
                getPolicyStatus('disability') === 'pending' ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {getStatusText(getPolicyStatus('disability'))}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
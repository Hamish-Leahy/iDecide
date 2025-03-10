import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FileText, Building2, Landmark, Briefcase, Shield, PiggyBank, Receipt, Upload, Download, Plus, Eye, Edit, Trash2, UserPlus, CreditCard, Calculator, AlertTriangle, X, ChevronRight } from 'lucide-react';
import TabNavigation from '../TabNavigation';
import FileUpload from '../FileUpload/FileUpload';
import PDFPreview from '../PDFPreview/PDFPreview';
import { useFinancialDocumentsStore } from '../../store/financialDocumentsStore';
import { format } from 'date-fns';

// Import all the section components
import BeneficiaryDesignations from './BeneficiaryDesignations';

const Overview = () => {
  const { documents, fetchDocuments } = useFinancialDocumentsStore();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Calculate document statistics
  const documentStats = documents.reduce((acc, doc) => {
    if (doc.status === 'needs_review') acc.needsAttention++;
    if (doc.metadata?.beneficiaries?.length > 0) acc.withBeneficiaries++;
    if (!doc.metadata?.beneficiaries?.length) acc.missingBeneficiaries++;
    return acc;
  }, { needsAttention: 0, withBeneficiaries: 0, missingBeneficiaries: 0 });

  // Get recent documents
  const recentDocuments = documents
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Get documents needing attention
  const attentionDocuments = documents
    .filter(doc => doc.status === 'needs_review')
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Financial Documents Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Needs Attention Box */}
        <div className="bg-gradient-to-br from-[#2D5959] to-[#85B1B1] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Needs Attention</h3>
            </div>
            <span className="text-2xl font-bold">{documentStats.needsAttention}</span>
          </div>
          <div className="space-y-4">
            {attentionDocuments.map((doc, index) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors"
                onClick={() => setSelectedDocument(doc)}
              >
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm opacity-75">{doc.documentType}</p>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Updates Box */}
        <div className="bg-gradient-to-br from-[#2D5959] to-[#85B1B1] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Recent Updates</h3>
            </div>
          </div>
          <div className="space-y-4">
            {recentDocuments.map((doc, index) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm opacity-75">
                    {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Beneficiary Status Box */}
        <div className="bg-gradient-to-br from-[#2D5959] to-[#85B1B1] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Beneficiary Status</h3>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-white bg-opacity-10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Designated</span>
                <span className="text-xl font-bold">{documentStats.withBeneficiaries}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${(documentStats.withBeneficiaries / documents.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-white bg-opacity-10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Needs Review</span>
                <span className="text-xl font-bold">{documentStats.needsAttention}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${(documentStats.needsAttention / documents.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-white bg-opacity-10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Missing</span>
                <span className="text-xl font-bold">{documentStats.missingBeneficiaries}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2" 
                  style={{ width: `${(documentStats.missingBeneficiaries / documents.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Modified Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#2D5959]" />
            <h3 className="text-xl font-semibold text-[#2D5959]">Recently Modified Documents</h3>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90">
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold">{doc.title}</h4>
                  <p className="text-sm text-gray-500">{doc.documentType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  doc.status === 'active' ? 'bg-green-100 text-green-800' :
                  doc.status === 'needs_review' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-4">
                {doc.metadata?.beneficiaries && (
                  <div>
                    <p className="text-sm text-gray-600">Beneficiaries</p>
                    <div className="flex gap-2 mt-1">
                      {doc.metadata.beneficiaries.map((beneficiary, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[#B5D3D3] bg-opacity-30 rounded-lg text-sm">
                          {beneficiary.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doc.metadata?.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-sm">{doc.metadata.notes}</p>
                  </div>
                )}

                <p className="text-sm text-gray-400">
                  Last updated: {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                </p>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowPreview(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-[#B5D3D3] hover:bg-opacity-20">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedDocument.title}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <PDFPreview
                file={selectedDocument.file}
                onFileChange={() => {}}
                onError={(error) => console.error(error)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FinanceSections = () => {
  const tabs = [
    { id: 'overview', label: 'Overview', path: '/finances' },
    { id: 'investments', label: 'Investments', path: '/finances/investments' },
    { id: 'real-estate', label: 'Real Estate', path: '/finances/real-estate' },
    { id: 'banking', label: 'Banking', path: '/finances/banking' },
    { id: 'insurance', label: 'Insurance', path: '/finances/insurance' },
    { id: 'retirement', label: 'Retirement', path: '/finances/retirement' },
    { id: 'taxes', label: 'Tax Documents', path: '/finances/taxes' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2D5959] mb-4">Financial Documents & Asset Distribution</h1>
        <p className="text-gray-600">Manage your financial documents and specify asset distribution instructions</p>
      </div>

      <TabNavigation tabs={tabs} />

      <div className="mt-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="investments" element={<div>Investments</div>} />
          <Route path="real-estate" element={<div>Real Estate</div>} />
          <Route path="banking" element={<div>Banking</div>} />
          <Route path="insurance" element={<div>Insurance</div>} />
          <Route path="retirement" element={<div>Retirement</div>} />
          <Route path="taxes" element={<div>Tax Documents</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default FinanceSections;
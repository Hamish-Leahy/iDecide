import React, { useState } from 'react';
import { Clock, UserCheck, Users, Calendar, FileText, Eye, Edit, Download, Upload, AlertTriangle, X } from 'lucide-react';
import { DocumentSection } from '../LegalMatters';
import FileUpload from '../../FileUpload/FileUpload';
import PDFPreview from '../../PDFPreview/PDFPreview';
import { useLegalChangesStore } from '../../../store/legalChangesStore';
import { useLegalDocumentsStore } from '../../../store/legalDocumentsStore';

const PowerOfAttorney = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const { addChange } = useLegalChangesStore();
  const { uploadDocument, validateDocument } = useLegalDocumentsStore();

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      try {
        // Upload document
        const documentId = await uploadDocument(file, 'power-of-attorney', {
          type: 'power-of-attorney',
          status: 'draft',
          agents: {
            primary: 'Sarah Johnson',
            alternate: 'Michael Smith'
          }
        });

        // Validate document
        const validationResults = await validateDocument(documentId);
        
        if (!validationResults.isComplete) {
          setShowValidation(true);
        }

        addChange({
          section: "Power of Attorney",
          action: "Document Upload",
          details: `Uploaded new power of attorney document: ${file.name}`
        });

        setShowUpload(false);
        setShowPreview(true);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const smartAssets = {
    agents: {
      primary: {
        name: "Sarah Johnson",
        relationship: "Sister",
        contact: "+1 (555) 987-6543",
        email: "sarah.johnson@example.com"
      },
      alternate: {
        name: "Michael Smith",
        relationship: "Brother",
        contact: "+1 (555) 123-4567",
        email: "michael.smith@example.com"
      }
    },
    lastReview: "2022-11-30",
    nextReview: "2024-11-30",
    status: "needs_review",
    keyPoints: [
      "Financial decisions and transactions authority",
      "Property management and real estate dealings",
      "Healthcare decisions (if applicable)",
      "Banking and investment management",
      "Tax matters and government benefits"
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Power of Attorney</h2>
      
      <div className="bg-[#85B1B1] p-6 rounded-lg mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm text-white font-medium">Last Updated</p>
              <p className="text-white text-opacity-90">{smartAssets.lastReview}</p>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-white" />
            <div className="relative group">
              <p className="text-sm text-white font-medium">Primary Agent</p>
              <p className="text-white text-opacity-90">{smartAssets.agents.primary.name}</p>
              
              {/* Primary Agent Details Popup */}
              <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 hidden group-hover:block z-10 w-64">
                <div className="text-gray-800 space-y-2">
                  <p className="font-medium">{smartAssets.agents.primary.name}</p>
                  <p className="text-sm">{smartAssets.agents.primary.relationship}</p>
                  <div className="text-sm space-y-1">
                    <p>{smartAssets.agents.primary.contact}</p>
                    <p>{smartAssets.agents.primary.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <Users className="w-5 h-5 text-white" />
            <div className="relative group">
              <p className="text-sm text-white font-medium">Alternate Agent</p>
              <p className="text-white text-opacity-90">{smartAssets.agents.alternate.name}</p>
              
              {/* Alternate Agent Details Popup */}
              <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 hidden group-hover:block z-10 w-64">
                <div className="text-gray-800 space-y-2">
                  <p className="font-medium">{smartAssets.agents.alternate.name}</p>
                  <p className="text-sm">{smartAssets.agents.alternate.relationship}</p>
                  <div className="text-sm space-y-1">
                    <p>{smartAssets.agents.alternate.contact}</p>
                    <p>{smartAssets.agents.alternate.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Key Points</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit Key Points">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download Summary">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {smartAssets.keyPoints.map((point, index) => (
          <div key={index} className="bg-[#B5D3D3] p-4 rounded-lg flex items-center justify-between group">
            <span>{point}</span>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2D5959] hover:text-white rounded transition-all">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-6 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
        
        <button 
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-6 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-[#B5D3D3] hover:bg-opacity-20 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Current Document
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Upload Power of Attorney</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <FileUpload
                onUpload={handleFileUpload}
                maxFiles={1}
                acceptedFileTypes={['application/pdf']}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <PDFPreview
                file={selectedFile}
                onFileChange={setSelectedFile}
                onError={(error) => console.error(error)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Document Validation</h3>
              <button
                onClick={() => setShowValidation(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 text-yellow-600 mb-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Document Needs Review</p>
                  <p className="text-sm">Please address the following issues:</p>
                </div>
              </div>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Missing notary signature
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Incomplete agent information
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Powers specification needed
                </li>
              </ul>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowValidation(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowValidation(false);
                    // Open edit mode
                  }}
                  className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
                >
                  Edit Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerOfAttorney;
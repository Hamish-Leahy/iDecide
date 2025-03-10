import React, { useState, useEffect } from 'react';
import { Clock, UserCheck, Users, FileText, Eye, Edit, Download, Upload, AlertTriangle, X } from 'lucide-react';
import { DocumentSection } from '../LegalMatters';
import FileUpload from '../../FileUpload/FileUpload';
import PDFPreview from '../../PDFPreview/PDFPreview';
import { useLegalChangesStore } from '../../../store/legalChangesStore';
import { useLegalDocumentsStore } from '../../../store/legalDocumentsStore';

const WillAndTestament = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const { addChange } = useLegalChangesStore();
  const { documents, uploadDocument, validateDocument } = useLegalDocumentsStore();
  const [loading, setLoading] = useState(true);

  // Get the current will document
  const willDocument = documents.find(doc => doc.documentType === 'will');

  useEffect(() => {
    if (documents.length > 0) {
      setLoading(false);
    }
  }, [documents]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      try {
        // Extract metadata from the document
        const extractedData = await extractWillData(file);
        
        // Upload document
        const documentId = await uploadDocument(file, 'will', {
          type: 'will',
          status: 'draft',
          executors: extractedData.executors,
          beneficiaries: extractedData.beneficiaries,
          assets: extractedData.assets,
          lastReview: new Date().toISOString(),
          nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        });

        // Validate document
        const validationResults = await validateDocument(documentId);
        
        if (!validationResults.isComplete) {
          setShowValidation(true);
        }

        addChange({
          section: "Will & Testament",
          action: "Document Upload",
          details: `Uploaded new will document: ${file.name}`
        });

        setShowUpload(false);
        setShowPreview(true);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  // Function to extract data from the will document
  const extractWillData = async (file: File) => {
    // This would integrate with a document parsing service
    // For now, return placeholder data based on file metadata
    return {
      executors: {
        primary: {
          name: "Primary Executor",
          relationship: "Relationship",
          contact: "Contact Info"
        },
        alternate: {
          name: "Alternate Executor",
          relationship: "Relationship",
          contact: "Contact Info"
        }
      },
      beneficiaries: [],
      assets: [],
      lastModified: file.lastModified,
      size: file.size
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5959]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Will & Testament</h2>
      
      <div className="bg-[#85B1B1] p-6 rounded-lg mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm text-white font-medium">Last Updated</p>
              <p className="text-white text-opacity-90">
                {willDocument?.updatedAt ? new Date(willDocument.updatedAt).toLocaleDateString() : 'Not created'}
              </p>
            </div>
          </div>
          
          {willDocument?.metadata?.executors?.primary && (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-white" />
              <div className="relative group">
                <p className="text-sm text-white font-medium">Executor</p>
                <p className="text-white text-opacity-90">{willDocument.metadata.executors.primary.name}</p>
                
                <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 hidden group-hover:block z-10 w-64">
                  <div className="text-gray-800 space-y-2">
                    <p className="font-medium">{willDocument.metadata.executors.primary.name}</p>
                    <p className="text-sm">{willDocument.metadata.executors.primary.relationship}</p>
                    <div className="text-sm space-y-1">
                      <p>{willDocument.metadata.executors.primary.contact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {willDocument?.metadata?.executors?.alternate && (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
              <Users className="w-5 h-5 text-white" />
              <div className="relative group">
                <p className="text-sm text-white font-medium">Alternate Executor</p>
                <p className="text-white text-opacity-90">{willDocument.metadata.executors.alternate.name}</p>
                
                <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 hidden group-hover:block z-10 w-64">
                  <div className="text-gray-800 space-y-2">
                    <p className="font-medium">{willDocument.metadata.executors.alternate.name}</p>
                    <p className="text-sm">{willDocument.metadata.executors.alternate.relationship}</p>
                    <div className="text-sm space-y-1">
                      <p>{willDocument.metadata.executors.alternate.contact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {willDocument?.metadata?.nextReview && (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-white" />
              <div>
                <p className="text-sm text-white font-medium">Next Review</p>
                <p className="text-white text-opacity-90">
                  {new Date(willDocument.metadata.nextReview).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {willDocument && (
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
          
          {willDocument.metadata?.keyPoints?.map((point: string, index: number) => (
            <div key={index} className="bg-[#B5D3D3] p-4 rounded-lg flex items-center justify-between group">
              <span>{point}</span>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2D5959] hover:text-white rounded transition-all">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(!willDocument.metadata?.keyPoints || willDocument.metadata.keyPoints.length === 0) && (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>No key points have been extracted from this document</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-6 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Will
        </button>
        
        {willDocument && (
          <button 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-6 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-[#B5D3D3] hover:bg-opacity-20 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Current Will
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Upload Will Document</h3>
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
              <h3 className="text-lg font-semibold">Will Preview</h3>
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
                  Missing witness signatures
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Incomplete beneficiary information
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Asset valuation needed
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

export default WillAndTestament;
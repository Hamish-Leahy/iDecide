import React, { useState } from 'react';
import { FileText, Upload, Download, Eye, Edit, Trash2, Plus } from 'lucide-react';
import FileUpload from '../../FileUpload/FileUpload';
import PDFPreview from '../../PDFPreview/PDFPreview';
import EmptyState from './EmptyState';

const AdvanceDirective = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasDocument, setHasDocument] = useState(false); // This would come from your store

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setShowUpload(false);
      setShowPreview(true);
      setHasDocument(true);
    }
  };

  if (!hasDocument) {
    return (
      <EmptyState
        title="No Advance Directive Found"
        description="Upload your advance directive to ensure your healthcare wishes are documented and accessible when needed."
        buttonText="Upload Advance Directive"
        onAction={() => setShowUpload(true)}
        icon={FileText}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Advance Directive</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
          >
            <Upload className="w-4 h-4" />
            Upload New Version
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-[#B5D3D3] hover:bg-opacity-20"
          >
            <Eye className="w-4 h-4" />
            View Document
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-[#B5D3D3] hover:bg-opacity-20"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B5D3D3] rounded-lg">
              <FileText className="w-6 h-6 text-[#2D5959]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Current Version</h3>
              <p className="text-gray-600">Last updated: January 15, 2024</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#B5D3D3] bg-opacity-10 rounded-lg">
            <h4 className="font-medium mb-2">Key Directives</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Life support preferences specified</li>
              <li>• Organ donation wishes documented</li>
              <li>• Pain management preferences included</li>
              <li>• Healthcare agent designated</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
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
    </div>
  );
};

export default AdvanceDirective;
import React, { useState } from 'react';
import { Clock, UserCheck, Landmark, Briefcase } from 'lucide-react';
import { DocumentSection } from '../LegalMatters';
import FileUpload from '../../FileUpload/FileUpload';
import PDFPreview from '../../PDFPreview/PDFPreview';
import { useLegalChangesStore } from '../../../store/legalChangesStore';

const Trusts = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { addChange } = useLegalChangesStore();

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setShowUpload(false);
      addChange({
        section: "Trusts",
        action: "Document Upload",
        details: `Uploaded new trust document: ${files[0].name}`
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Trust Documents</h2>
      
      <div className="bg-[#85B1B1] p-6 rounded-lg mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm text-white font-medium">Last Updated</p>
              <p className="text-white text-opacity-90">2023-08-15</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm text-white font-medium">Trustee</p>
              <p className="text-white text-opacity-90">David Anderson</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <Landmark className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm text-white font-medium">Trust Type</p>
              <p className="text-white text-opacity-90">Revocable Living Trust</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm text-white font-medium">Assets Value</p>
              <p className="text-white text-opacity-90">$2.5M</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">Key Points</h3>
        <div className="bg-[#B5D3D3] p-4 rounded-lg">
          Trust purpose and objectives
        </div>
        <div className="bg-[#B5D3D3] p-4 rounded-lg">
          Asset inventory and valuation
        </div>
        <div className="bg-[#B5D3D3] p-4 rounded-lg">
          Distribution schedule and terms
        </div>
        <div className="bg-[#B5D3D3] p-4 rounded-lg">
          Successor trustee provisions
        </div>
        <div className="bg-[#B5D3D3] p-4 rounded-lg">
          Tax planning considerations
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-[#2D5959] text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          Upload Trust Document
        </button>
        <button 
          className="bg-[#2D5959] text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          onClick={() => window.open('https://willpro.com.au', '_blank')}
        >
          Create With Willpro
        </button>
      </div>

      {showUpload && (
        <div className="mt-8">
          <FileUpload
            onUpload={handleFileUpload}
            maxFiles={1}
            acceptedFileTypes={['application/pdf']}
          />
        </div>
      )}

      {selectedFile && (
        <div className="mt-8">
          <PDFPreview
            file={selectedFile}
            onFileChange={setSelectedFile}
            onError={(error) => console.error(error)}
          />
        </div>
      )}
    </div>
  );
};

export default Trusts;
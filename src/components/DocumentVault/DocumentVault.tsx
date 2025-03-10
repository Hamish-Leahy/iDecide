import React, { useState } from 'react';
import { Search, Upload, Filter, Grid, List, Eye, Download, Trash2, Clock, FileText, Image as ImageIcon, FileSpreadsheet, Film } from 'lucide-react';
import FileUpload from '../FileUpload/FileUpload';
import PDFPreview from '../PDFPreview/PDFPreview';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'spreadsheet' | 'video';
  size: string;
  lastModified: string;
  category: string;
  tags: string[];
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Last Will and Testament.pdf',
    type: 'pdf',
    size: '2.4 MB',
    lastModified: '2024-02-20',
    category: 'Legal',
    tags: ['Will', 'Legal', 'Important']
  },
  {
    id: '2',
    name: 'Property Deed.pdf',
    type: 'pdf',
    size: '1.8 MB',
    lastModified: '2024-02-15',
    category: 'Real Estate',
    tags: ['Property', 'Legal']
  },
  {
    id: '3',
    name: 'Insurance Policy.pdf',
    type: 'pdf',
    size: '3.2 MB',
    lastModified: '2024-02-10',
    category: 'Insurance',
    tags: ['Insurance', 'Policy']
  }
];

const DocumentVault = () => {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'image':
        return ImageIcon;
      case 'spreadsheet':
        return FileSpreadsheet;
      case 'video':
        return Film;
      default:
        return FileText;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFileUpload = (files: File[]) => {
    // Here we would handle the file upload to the database
    console.log('Files to upload:', files);
    setShowUpload(false);
  };

  const DocumentCard = ({ document }: { document: Document }) => {
    const Icon = getIconForType(document.type);
    
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-[#B5D3D3] bg-opacity-50 rounded-lg">
            <Icon className="w-6 h-6 text-[#2D5959]" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedDocument(document)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <h3 className="font-medium mb-1 truncate">{document.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Clock className="w-4 h-4" />
          <span>{document.lastModified}</span>
          <span>•</span>
          <span>{document.size}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {document.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-[#B5D3D3] bg-opacity-30 rounded-lg text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const DocumentRow = ({ document }: { document: Document }) => {
    const Icon = getIconForType(document.type);
    
    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2 bg-[#B5D3D3] bg-opacity-50 rounded-lg">
            <Icon className="w-6 h-6 text-[#2D5959]" />
          </div>
          <div>
            <h3 className="font-medium mb-1">{document.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{document.lastModified}</span>
              <span>•</span>
              <span>{document.size}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {document.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-[#B5D3D3] bg-opacity-30 rounded-lg text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2 ml-4">
          <button 
            onClick={() => setSelectedDocument(document)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#2D5959]">Document Vault</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#2D5959] focus:border-transparent"
          />
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-[#B5D3D3]' : 'hover:bg-gray-50'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-[#B5D3D3]' : 'hover:bg-gray-50'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map(doc => (
            <DocumentRow key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {showUpload && (
        <div className="mt-8">
          <FileUpload
            onUpload={handleFileUpload}
            maxFiles={5}
            acceptedFileTypes={['application/pdf', 'image/*']}
          />
        </div>
      )}

      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <PDFPreview
                file={previewFile}
                onFileChange={setPreviewFile}
                onError={(error) => console.error(error)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
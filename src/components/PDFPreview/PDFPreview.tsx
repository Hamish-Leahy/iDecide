import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFPreviewProps {
  file: File | null;
  onFileChange: (file: File) => void;
  onError?: (error: Error) => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ file, onFileChange, onError }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onFileChange(file);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  const handleDownload = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!file) {
    return (
      <div
        {...getRootProps()}
        className={`
          h-[400px] bg-white rounded-lg shadow-sm flex flex-col items-center justify-center cursor-pointer
          border-2 border-dashed transition-colors
          ${isDragActive ? 'border-[#2D5959] bg-[#B5D3D3] bg-opacity-10' : 'border-gray-300 hover:border-[#85B1B1]'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mb-4 text-[#2D5959]" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop PDF here' : 'Drag & drop your will here'}
        </p>
        <p className="text-sm text-gray-500">or click to select PDF</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 2}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        {...getRootProps()}
        className="bg-white rounded-lg shadow-sm overflow-auto max-h-[600px]"
      >
        <input {...getInputProps()} />
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => {
            setIsLoading(false);
            onError?.(error);
          }}
          loading={
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          }
          error={
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-red-500">Error loading PDF</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            }
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFPreview;
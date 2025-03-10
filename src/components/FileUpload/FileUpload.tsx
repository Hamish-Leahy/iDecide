import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ChevronLeft, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react';
import FilePreview from './FilePreview';

interface FileWithPreview extends File {
  preview: string;
}

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxFiles = 10,
  acceptedFileTypes = ['application/pdf', 'image/*'],
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      setErrorMessage(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );

    setFiles(prev => [...prev, ...newFiles]);
    setErrorMessage(null);
    onUpload(acceptedFiles);
  }, [files.length, maxFiles, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxFiles,
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    if (currentFileIndex >= index) {
      setCurrentFileIndex(prev => Math.max(0, prev - 1));
    }
  };

  const navigateFiles = (direction: 'prev' | 'next') => {
    setCurrentFileIndex(prev => {
      if (direction === 'prev') {
        return prev > 0 ? prev - 1 : files.length - 1;
      } else {
        return prev < files.length - 1 ? prev + 1 : 0;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isDragActive ? 'border-[#2D5959] bg-[#B5D3D3] bg-opacity-10' : 'border-gray-300 hover:border-[#85B1B1]'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-[#2D5959]" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-500 mb-4">or click to select files</p>
        <p className="text-xs text-gray-400">
          Supported formats: PDF, Images • Max {maxFiles} files
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* File Preview Area */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Preview Navigation */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Uploaded Files ({files.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigateFiles('prev')}
                className="p-2 rounded-lg hover:bg-gray-100"
                disabled={files.length <= 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateFiles('next')}
                className="p-2 rounded-lg hover:bg-gray-100"
                disabled={files.length <= 1}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* File List */}
          <div className="grid grid-cols-6 gap-4 p-4 border-b">
            {files.map((file, index) => (
              <div
                key={file.preview}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                  ${index === currentFileIndex ? 'border-[#2D5959]' : 'border-transparent hover:border-[#85B1B1]'}
                `}
                onClick={() => setCurrentFileIndex(index)}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Main Preview */}
          <div className="p-4">
            <FilePreview file={files[currentFileIndex]} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
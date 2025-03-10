import React from 'react';
import { FileText } from 'lucide-react';

interface FilePreviewProps {
  file: File & { preview?: string };
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  if (!file) return null;

  return (
    <div className="rounded-lg overflow-hidden bg-gray-50">
      {file.type.startsWith('image/') ? (
        <img
          src={file.preview}
          alt={file.name}
          className="max-h-[500px] w-full object-contain"
        />
      ) : (
        <div className="h-[500px] flex flex-col items-center justify-center">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">{file.name}</p>
          <p className="text-sm text-gray-400">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
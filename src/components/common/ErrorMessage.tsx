import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-center gap-2 p-4 text-idecide-error bg-red-50 rounded-lg ${className}`}>
      <AlertCircle className="flex-shrink-0" size={20} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
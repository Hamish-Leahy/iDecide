import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle } from 'lucide-react';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-[#1E1B4B] text-white py-2 px-4 rounded-lg hover:bg-[#1E1B4B]/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
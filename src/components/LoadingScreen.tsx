import React from 'react';

interface LoadingScreenProps {
  timeout?: number;
}

export function LoadingScreen({ timeout = 10000 }: LoadingScreenProps) {
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-idecide-primary">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-idecide-dark border-t-transparent mb-4"></div>
        <div className="text-2xl font-semibold text-idecide-dark">
          {showTimeout ? (
            <div className="text-center">
              <p className="mb-2">This is taking longer than expected</p>
              <p className="text-sm text-gray-600">Please refresh the page if the issue persists</p>
            </div>
          ) : (
            "Loading..."
          )}
        </div>
      </div>
    </div>
  );
}
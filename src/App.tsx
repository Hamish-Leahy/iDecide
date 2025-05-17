import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './components/AppRouter';
import { AppErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
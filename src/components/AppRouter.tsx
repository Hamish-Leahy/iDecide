import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { OnboardingFlow } from './OnboardingFlow';
import Dashboard from './Dashboard';
import { LoadingScreen } from './LoadingScreen';

export function AppRouter() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If no user, show auth page
  if (!user) {
    return <AuthPage />;
  }

  // If user exists but no profile or onboarding not completed, show onboarding
  const needsOnboarding = !profile?.onboarding_completed;

  return (
    <Router>
      <Routes>
        <Route 
          path="/onboarding" 
          element={needsOnboarding ? <OnboardingFlow /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/dashboard/*" 
          element={needsOnboarding ? <Navigate to="/onboarding" replace /> : <Dashboard />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} replace />} 
        />
      </Routes>
    </Router>
  );
}
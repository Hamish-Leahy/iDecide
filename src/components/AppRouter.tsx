import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { OnboardingFlow } from './OnboardingFlow';
import Dashboard from './Dashboard';
import { LoadingScreen } from './LoadingScreen';
import { travelRoutes } from './routes/travelRoutes';

// Need to clean this function up later. 
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
          path="/travel/*" 
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {travelRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Routes>
              </Suspense>
            )
          }
        />
        <Route 
          path="/" 
          element={<Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} replace />} 
        />
      </Routes>
    </Router>
  );
}
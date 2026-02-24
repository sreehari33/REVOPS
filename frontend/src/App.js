import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import '@/App.css';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import WorkshopSetup from '@/pages/WorkshopSetup';
import OwnerDashboard from '@/pages/OwnerDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import JobsList from '@/pages/JobsList';
import JobDetail from '@/pages/JobDetail';
import CreateJob from '@/pages/CreateJob';
import ManagersPage from '@/pages/ManagersPage';
import PaymentsPage from '@/pages/PaymentsPage';
import SettingsPage from '@/pages/SettingsPage';

// Layout
import DashboardLayout from '@/components/DashboardLayout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Workshop Setup */}
          <Route 
            path="/workshop-setup" 
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <WorkshopSetup />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes with Dashboard Layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardRouter />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JobsList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs/new" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <DashboardLayout>
                  <CreateJob />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs/:id" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JobDetail />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/managers" 
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <DashboardLayout>
                  <ManagersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/payments" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PaymentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <DashboardLayout>
                  <div className="text-center py-12">
                    <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Advanced Reports</h1>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                      View your analytics dashboard for comprehensive insights. Advanced custom reports coming soon.
                    </p>
                    <Button onClick={() => window.location.href = '/dashboard'} className="bg-primary hover:bg-red-700">
                      Go to Analytics Dashboard
                    </Button>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster theme="dark" position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Dashboard Router - Shows different dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  return user?.role === 'owner' ? <OwnerDashboard /> : <ManagerDashboard />;
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './pages/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1713',
              color: '#f7f5f2',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.25)',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#1a1713' }
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1a1713' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

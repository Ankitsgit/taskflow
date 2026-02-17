import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-ink-300 border-t-ink-800 rounded-full animate-spin" />
          <p className="text-ink-500 font-body text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

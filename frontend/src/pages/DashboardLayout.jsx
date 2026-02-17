import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

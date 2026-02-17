import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CheckSquare, LayoutDashboard, ListTodo, User, LogOut,
  Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out. See you soon!');
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-ink-100">
        <CheckSquare size={20} className="text-ink-900" />
        <span className="font-display text-ink-900 text-lg font-700">TaskFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
              ${isActive
                ? 'bg-ink-950 text-white'
                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : 'text-ink-500 group-hover:text-ink-700'} />
                <span className="font-body font-500 text-sm">{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-white/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-ink-100">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-ink-950 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-white text-xs font-700">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body font-500 text-ink-900 text-sm truncate">{user?.name}</p>
            <p className="font-mono text-ink-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-ink-500
                     hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut size={18} />
          <span className="font-body font-500 text-sm">Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-ink-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-ink-900" />
          <span className="font-display text-ink-900 font-700">TaskFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-ink-100 text-ink-600"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-72 bg-white h-full animate-slide-in">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-ink-100">
              <X size={18} className="text-ink-600" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-ink-100 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;

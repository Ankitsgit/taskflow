import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ListTodo, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { taskAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div
    className="card p-5 flex items-center gap-4 animate-slide-up"
    style={{ animationDelay: delay }}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-ink-500 font-body text-sm">{label}</p>
      <p className="font-display text-ink-950 text-2xl font-700">{value}</p>
    </div>
  </div>
);

const OverviewPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ todo: 0, 'in-progress': 0, done: 0, total: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          taskAPI.getStats(),
          taskAPI.getAll({ limit: 5, sortBy: 'createdAt', order: 'desc' })
        ]);
        setStats(statsRes.data.stats);
        setRecentTasks(tasksRes.data.tasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const completionRate = stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  const statusConfig = {
    'todo': { label: 'To Do', className: 'status-todo' },
    'in-progress': { label: 'In Progress', className: 'status-in-progress' },
    'done': { label: 'Done', className: 'status-done' },
  };

  const priorityConfig = {
    'high': { className: 'priority-high' },
    'medium': { className: 'priority-medium' },
    'low': { className: 'priority-low' },
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <p className="text-ink-400 font-body text-sm mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="font-display text-ink-950 text-3xl font-800">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-ink-500 font-body mt-1">
          {stats.total === 0
            ? "You're all clear! Start adding tasks."
            : `You have ${stats.todo + stats['in-progress']} task${stats.todo + stats['in-progress'] !== 1 ? 's' : ''} remaining.`
          }
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ListTodo} label="Total Tasks" value={stats.total} color="bg-ink-100 text-ink-700" delay="0ms" />
        <StatCard icon={Clock} label="To Do" value={stats.todo} color="bg-blue-50 text-blue-600" delay="60ms" />
        <StatCard icon={TrendingUp} label="In Progress" value={stats['in-progress']} color="bg-amber-50 text-amber-600" delay="120ms" />
        <StatCard icon={CheckCircle2} label="Done" value={stats.done} color="bg-emerald-50 text-emerald-600" delay="180ms" />
      </div>

      {/* Progress bar */}
      <div className="card p-6 mb-8 animate-slide-up" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-ink-900 font-600">Overall Progress</h3>
            <p className="text-ink-400 text-sm font-body">{stats.done} of {stats.total} tasks completed</p>
          </div>
          <span className="font-display text-ink-950 text-2xl font-700">{completionRate}%</span>
        </div>
        <div className="w-full bg-ink-100 rounded-full h-2.5">
          <div
            className="bg-ink-900 h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Recent tasks */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-ink-950 text-xl font-700">Recent Tasks</h2>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/tasks"
              className="btn-ghost text-sm flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-ink-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-ink-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ListTodo size={28} className="text-ink-400" />
            </div>
            <p className="font-display text-ink-700 font-600 mb-1">No tasks yet</p>
            <p className="text-ink-400 font-body text-sm mb-4">Add your first task to get started.</p>
            <Link to="/dashboard/tasks" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus size={16} /> Create task
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {recentTasks.map(task => (
              <div key={task._id} className="card p-4 hover:shadow-soft transition-all duration-200 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-body font-500 text-ink-900 text-sm truncate ${task.status === 'done' ? 'line-through text-ink-400' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-ink-400 text-xs font-body mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`tag-badge ${priorityConfig[task.priority]?.className}`}>
                      {task.priority}
                    </span>
                    <span className={`tag-badge ${statusConfig[task.status]?.className}`}>
                      {statusConfig[task.status]?.label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;

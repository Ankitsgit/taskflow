import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, Tag, Calendar, AlertCircle } from 'lucide-react';
import { taskAPI } from '../utils/api';
import TaskModal from '../components/dashboard/TaskModal';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const statusConfig = {
  'todo': { label: 'To Do', className: 'status-todo' },
  'in-progress': { label: 'In Progress', className: 'status-in-progress' },
  'done': { label: 'Done', className: 'status-done' },
};

const priorityConfig = {
  'high': { label: 'High', className: 'priority-high' },
  'medium': { label: 'Medium', className: 'priority-medium' },
  'low': { label: 'Low', className: 'priority-low' },
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  const isDue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div className="card p-4 hover:shadow-soft transition-all duration-200 group">
      <div className="flex items-start gap-3">
        {/* Priority dot */}
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
          task.priority === 'high' ? 'bg-red-400' :
          task.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-body font-500 text-ink-900 text-sm leading-snug ${task.status === 'done' ? 'line-through text-ink-400' : ''}`}>
              {task.title}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-700 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-ink-400 text-xs font-body mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={`tag-badge ${statusConfig[task.status]?.className}`}>
              {statusConfig[task.status]?.label}
            </span>
            <span className={`tag-badge ${priorityConfig[task.priority]?.className}`}>
              {task.priority}
            </span>

            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 text-xs font-mono ${isDue ? 'text-red-500' : 'text-ink-400'}`}>
                {isDue && <AlertCircle size={11} />}
                <Calendar size={11} />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {task.tags?.map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-xs font-mono text-ink-400">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        ...(search && { search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
      };
      const { data } = await taskAPI.getAll(params);
      setTasks(data.tasks);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, filters, pagination.page]);

  useEffect(() => {
    const timeout = setTimeout(fetchTasks, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      setTasks(prev => prev.filter(t => t._id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaved = (savedTask, action) => {
    if (action === 'create') {
      setTasks(prev => [savedTask, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
    } else {
      setTasks(prev => prev.map(t => t._id === savedTask._id ? savedTask : t));
    }
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '' });
    setSearch('');
  };

  const activeFiltersCount = [filters.status, filters.priority, search].filter(Boolean).length;

  const grouped = {
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-ink-950 text-2xl font-800">Tasks</h1>
          <p className="text-ink-400 font-body text-sm mt-0.5">
            {pagination.total} task{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New task
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-6 animate-slide-up" style={{ animationDelay: '60ms' }}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 text-sm relative ${showFilters ? 'bg-ink-900 text-white border-ink-900' : ''}`}
          >
            <Filter size={15} /> Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-xs font-display font-700 text-ink-950 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="btn-ghost text-sm text-red-500 hover:bg-red-50">
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex gap-3 p-4 bg-white rounded-xl border border-ink-100 animate-fade-in">
            <div className="flex-1">
              <label className="block text-ink-500 font-mono text-xs mb-1.5">STATUS</label>
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">All statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-ink-500 font-mono text-xs mb-1.5">PRIORITY</label>
              <select
                value={filters.priority}
                onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-ink-100 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-ink-100 rounded w-2/3" />
                  <div className="h-3 bg-ink-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-ink-400" />
          </div>
          <p className="font-display text-ink-700 font-600 mb-1">
            {search || filters.status || filters.priority ? 'No matching tasks' : 'No tasks yet'}
          </p>
          <p className="text-ink-400 font-body text-sm mb-4">
            {search || filters.status || filters.priority
              ? 'Try adjusting your filters.'
              : 'Create your first task to get started.'
            }
          </p>
          {!search && !filters.status && !filters.priority && (
            <button onClick={handleOpenCreate} className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus size={16} /> Create task
            </button>
          )}
        </div>
      ) : (
        // Group by status if no filters
        filters.status ? (
          <div className="space-y-3 animate-stagger">
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {[
              { key: 'in-progress', label: 'In Progress', tasks: grouped['in-progress'] },
              { key: 'todo', label: 'To Do', tasks: grouped.todo },
              { key: 'done', label: 'Done', tasks: grouped.done },
            ].filter(g => g.tasks.length > 0).map(group => (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-display text-ink-700 font-600 text-sm">{group.label}</h3>
                  <span className="bg-ink-100 text-ink-500 font-mono text-xs px-2 py-0.5 rounded-full">
                    {group.tasks.length}
                  </span>
                </div>
                <div className="space-y-2 animate-stagger">
                  {group.tasks.map(task => (
                    <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default TasksPage;

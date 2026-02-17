import React, { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { taskAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const TaskModal = ({ task, onClose, onSaved }) => {
  const isEditing = !!task?._id;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    tags: [],
    dueDate: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        tags: task.tags || [],
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    }
  }, [task]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    else if (formData.title.length < 2) errs.title = 'Title must be at least 2 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate || null
      };

      if (isEditing) {
        const { data } = await taskAPI.update(task._id, payload);
        toast.success('Task updated');
        onSaved(data.task, 'update');
      } else {
        const { data } = await taskAPI.create(payload);
        toast.success('Task created');
        onSaved(data.task, 'create');
      }
      onClose();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save task';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-100">
          <h2 className="font-display text-ink-950 font-700 text-lg">
            {isEditing ? 'Edit task' : 'New task'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">
              Task title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              className={`input-field ${errors.title ? 'border-red-400' : ''}`}
              autoFocus
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add context or details..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Due date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">
              Tags <span className="text-ink-400 font-mono text-xs">({formData.tags.length}/5)</span>
            </label>
            <div className={`input-field flex flex-wrap gap-1.5 min-h-[44px] cursor-text ${formData.tags.length > 0 ? 'py-2' : ''}`}
              onClick={() => document.getElementById('tag-input').focus()}>
              {formData.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-ink-100 text-ink-700 text-xs font-mono px-2 py-1 rounded-lg">
                  <Tag size={10} />
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={formData.tags.length === 0 ? "Add tags (press Enter)" : ""}
                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm font-body"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isEditing ? 'Update task' : <><Plus size={16} /> Create task</>}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

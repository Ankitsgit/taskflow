import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach(e => {
          apiErrors[e.path] = e.msg;
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={24} className="text-amber-400" />
            <span className="font-display text-white text-xl font-700">TaskFlow</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-display text-white text-5xl font-800 leading-tight mb-4">
              Your work,<br />
              <span className="text-amber-400">organized.</span>
            </h1>
            <p className="text-ink-400 font-body text-lg leading-relaxed">
              The minimal workspace for teams who ship. Track tasks, collaborate, and stay focused on what matters.
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-ink-900 rounded-2xl p-6 border border-ink-800">
            <p className="text-ink-300 font-body text-sm italic leading-relaxed mb-4">
              "TaskFlow transformed how our team operates. Clean, fast, and exactly what we needed."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="font-display text-ink-950 text-xs font-700">RK</span>
              </div>
              <div>
                <p className="text-white font-body text-sm font-500">Riya Kapoor</p>
                <p className="text-ink-500 font-mono text-xs">Product Lead, Volta</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-ink-600 font-mono text-xs">
          © 2024 TaskFlow. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <CheckSquare size={22} className="text-ink-900" />
            <span className="font-display text-ink-900 text-xl font-700">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-ink-950 text-3xl font-800 mb-2">Sign in</h2>
            <p className="text-ink-500 font-body">
              New here?{' '}
              <Link to="/register" className="text-ink-900 font-500 underline underline-offset-2 hover:text-ink-700">
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-body mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pr-12 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs font-body mt-1.5">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {/* <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 font-mono text-xs font-500 mb-1">Demo credentials</p>
            <p className="text-amber-700 font-mono text-xs">demo@taskflow.io / demo1234</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

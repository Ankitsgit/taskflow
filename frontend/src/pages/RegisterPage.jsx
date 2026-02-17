import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckSquare, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-400', 'bg-emerald-500'][strength];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(formData.password)) newErrors.password = 'Password must contain a number';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created! Welcome to TaskFlow.');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed.';
      toast.error(message);
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach(e => { apiErrors[e.path] = e.msg; });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-2 mb-8">
          <CheckSquare size={22} className="text-ink-900" />
          <span className="font-display text-ink-900 text-xl font-700">TaskFlow</span>
        </div>

        <div className="mb-8">
          <h2 className="font-display text-ink-950 text-3xl font-800 mb-2">Create account</h2>
          <p className="text-ink-500 font-body">
            Already have one?{' '}
            <Link to="/login" className="text-ink-900 font-500 underline underline-offset-2 hover:text-ink-700">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Full name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              autoComplete="name"
            />
            {errors.name && <p className="text-red-500 text-xs font-body mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs font-body mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters with a number"
                className={`input-field pr-12 ${errors.password ? 'border-red-400' : ''}`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-ink-200'}`}
                    />
                  ))}
                </div>
                <p className="text-ink-500 font-mono text-xs">{strengthLabel}</p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs font-body mt-1.5">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Confirm password</label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`input-field pr-12 ${errors.confirmPassword ? 'border-red-400' : formData.confirmPassword && formData.confirmPassword === formData.password ? 'border-green-400' : ''}`}
              />
              {formData.confirmPassword && formData.confirmPassword === formData.password && (
                <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs font-body mt-1.5">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
            ) : (
              <>Get started <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-ink-400 font-body text-xs">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

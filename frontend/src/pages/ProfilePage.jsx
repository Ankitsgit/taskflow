import React, { useState } from 'react';
import { User, Lock, Save, Camera } from 'lucide-react';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const validateProfile = () => {
    const errs = {};
    if (!profileData.name.trim()) errs.name = 'Name is required';
    else if (profileData.name.length < 2) errs.name = 'Min 2 characters';
    if (profileData.bio.length > 200) errs.bio = 'Max 200 characters';
    if (profileData.avatar && !/^https?:\/\/.+/.test(profileData.avatar)) errs.avatar = 'Must be a valid URL';
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordData.currentPassword) errs.currentPassword = 'Required';
    if (!passwordData.newPassword) errs.newPassword = 'Required';
    else if (passwordData.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    else if (!/\d/.test(passwordData.newPassword)) errs.newPassword = 'Must contain a number';
    if (passwordData.newPassword !== passwordData.confirmNewPassword) errs.confirmNewPassword = 'Passwords do not match';
    return errs;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }

    setProfileLoading(true);
    try {
      const { data } = await userAPI.updateProfile(profileData);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return; }

    setPasswordLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-ink-950 text-2xl font-800">Profile</h1>
        <p className="text-ink-400 font-body text-sm mt-0.5">Manage your account settings</p>
      </div>

      {/* Avatar section */}
      <div className="card p-6 flex items-center gap-5 mb-6 animate-slide-up">
        <div className="relative">
          {profileData.avatar ? (
            <img
              src={profileData.avatar}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-ink-100"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-ink-950 flex items-center justify-center">
              <span className="font-display text-white text-xl font-700">{initials}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-ink-200 flex items-center justify-center">
            <Camera size={12} className="text-ink-500" />
          </div>
        </div>
        <div>
          <p className="font-display text-ink-950 font-700 text-lg">{user?.name}</p>
          <p className="font-mono text-ink-400 text-sm">{user?.email}</p>
          <p className="font-mono text-ink-300 text-xs mt-0.5">
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-ink-100 rounded-xl mb-6 animate-slide-up" style={{ animationDelay: '60ms' }}>
        {[
          { id: 'profile', label: 'Profile Info', icon: User },
          { id: 'security', label: 'Security', icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-body font-500 transition-all duration-150
              ${activeTab === id ? 'bg-white text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-700'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {activeTab === 'profile' && (
        <div className="card p-6 animate-fade-in">
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Full name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className={`input-field ${profileErrors.name ? 'border-red-400' : ''}`}
              />
              {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
            </div>

            <div>
              <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us a little about yourself..."
                rows={3}
                className={`input-field resize-none ${profileErrors.bio ? 'border-red-400' : ''}`}
              />
              <div className="flex justify-between mt-1">
                {profileErrors.bio ? <p className="text-red-500 text-xs">{profileErrors.bio}</p> : <span />}
                <span className="text-ink-300 font-mono text-xs">{profileData.bio.length}/200</span>
              </div>
            </div>

            <div>
              <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">Avatar URL</label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={e => setProfileData(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
                className={`input-field ${profileErrors.avatar ? 'border-red-400' : ''}`}
              />
              {profileErrors.avatar && <p className="text-red-500 text-xs mt-1">{profileErrors.avatar}</p>}
            </div>

            <div className="pt-1">
              <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2">
                {profileLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Save size={16} />}
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security form */}
      {activeTab === 'security' && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <Lock size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-700 font-body text-sm">
              Choose a strong password with at least 6 characters and a number.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {[
              { key: 'currentPassword', label: 'Current password', placeholder: 'Your current password' },
              { key: 'newPassword', label: 'New password', placeholder: 'Min. 6 chars, include a number' },
              { key: 'confirmNewPassword', label: 'Confirm new password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-ink-700 font-body font-500 text-sm mb-1.5">{label}</label>
                <input
                  type="password"
                  value={passwordData[key]}
                  onChange={e => {
                    setPasswordData(prev => ({ ...prev, [key]: e.target.value }));
                    if (passwordErrors[key]) setPasswordErrors(prev => ({ ...prev, [key]: '' }));
                  }}
                  placeholder={placeholder}
                  className={`input-field ${passwordErrors[key] ? 'border-red-400' : ''}`}
                />
                {passwordErrors[key] && <p className="text-red-500 text-xs mt-1">{passwordErrors[key]}</p>}
              </div>
            ))}

            <div className="pt-1">
              <button type="submit" disabled={passwordLoading} className="btn-primary flex items-center gap-2">
                {passwordLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Lock size={16} />}
                Update password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

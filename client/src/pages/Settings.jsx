import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Shield, KeyRound, Smartphone, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put('/users/profile', {
        name,
        phone,
        twoFactorEnabled,
        ...(newPassword && { currentPassword, newPassword })
      });
      setMessage('Settings updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, authentication credentials, and 2-step verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition ${
              activeTab === 'profile'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition ${
              activeTab === 'security'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Password & Security</span>
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition ${
              activeTab === '2fa'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Two-Step Verification</span>
          </button>
        </div>

        <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          {message && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {activeTab === 'profile' && (
              <>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Personal Information
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Change Password
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </>
            )}

            {activeTab === '2fa' && (
              <>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Two-Step Verification (2FA)
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">Email & SMS OTP Verification</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Require a 6-digit code on new device sign-ins.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
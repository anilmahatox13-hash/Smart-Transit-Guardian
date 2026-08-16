import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bus, Lock, Mail, AlertCircle, CheckCircle2, Shield, Truck, User, ArrowRight, KeyRound, X } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('passenger1@transit.com');
  const [password, setPassword] = useState('Password123!');
  const [activeRole, setActiveRole] = useState('passenger');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role, demoEmail) => {
    setActiveRole(role);
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    if (!forgotEmail) {
      setForgotErr('Please enter your email first.');
      return;
    }
    setForgotLoading(true);
    setForgotErr('');
    try {
      const res = await api.post('/auth/send-otp', { email: forgotEmail });
      setOtpSent(true);
      setForgotMsg(`OTP code sent! (Demo preview: ${res.data.otpPreview || '123456'})`);
    } catch (err) {
      setForgotErr(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotErr('');
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword
      });
      setForgotMsg('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setPassword(newPassword);
        setEmail(forgotEmail);
      }, 1500);
    } catch (err) {
      setForgotErr(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
        
        <div className="text-center mb-6">
          <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to SmartTransit</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-Time Fleet & Telematics Management</p>
        </div>

        {/* Integrated Role Switcher Chips Above Email */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Select Account Role
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('passenger', 'passenger1@transit.com')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                activeRole === 'passenger'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Passenger</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('driver', 'driver1@transit.com')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                activeRole === 'driver'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin', 'admin@transit.com')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                activeRole === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setActiveRole('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition duration-150 flex items-center justify-center space-x-2 text-sm shadow-sm"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Register with OTP
          </Link>
        </p>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-3">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Reset Password</h3>
            </div>

            {forgotMsg && (
              <div className="mb-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotMsg}</span>
              </div>
            )}

            {forgotErr && (
              <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotErr}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@transit.com"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    disabled={forgotLoading}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center tracking-widest text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl text-xs transition"
                  >
                    Confirm & Update Password
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
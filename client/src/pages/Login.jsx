import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';
import { 
  Lock, 
  User, 
  AlertCircle, 
  Shield, 
  Truck, 
  Building2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  X,
  Sparkles,
  Zap
} from 'lucide-react';

const Login = () => {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('passenger1@transit.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('passenger');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  if (user) {
    if (user.role === 'operator') return <Navigate to="/operator" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'driver') return <Navigate to="/driver" replace />;
    return <Navigate to="/" replace />;
  }

  const roleConfigs = [
    {
      id: 'passenger',
      title: 'Commuter',
      email: 'passenger1@transit.com',
      icon: User,
      badge: 'Public Radar',
      activeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-emerald-500/10',
      iconColor: 'text-emerald-500'
    },
    {
      id: 'operator',
      title: 'Bus Owner',
      email: 'operator1@transit.com',
      icon: Building2,
      badge: 'Fleet & KYC',
      activeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500 shadow-sky-500/10',
      iconColor: 'text-sky-500'
    },
    {
      id: 'driver',
      title: 'Driver',
      email: 'driver1@transit.com',
      icon: Truck,
      badge: 'GPS Console',
      activeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500 shadow-amber-500/10',
      iconColor: 'text-amber-500'
    },
    {
      id: 'admin',
      title: 'Authority',
      email: 'admin@transit.com',
      icon: Shield,
      badge: 'Compliance',
      activeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500 shadow-purple-500/10',
      iconColor: 'text-purple-500'
    }
  ];

  const handleRoleSelect = (roleId, demoEmail) => {
    setActiveRole(roleId);
    setIdentifier(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(identifier, password);
      if (loggedInUser.role === 'operator') navigate('/operator');
      else if (loggedInUser.role === 'admin') navigate('/admin');
      else if (loggedInUser.role === 'driver') navigate('/driver');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email/phone or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    if (!forgotIdentifier) {
      setForgotErr('Please enter your registered email or phone.');
      return;
    }
    setForgotLoading(true);
    setForgotErr('');
    try {
      const res = await api.post('/auth/send-otp', { identifier: forgotIdentifier });
      setOtpSent(true);
      setForgotMsg(`OTP sent! (Demo preview code: ${res.data.otpPreview || '123456'})`);
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
        identifier: forgotIdentifier,
        otp: forgotOtp,
        newPassword
      });
      setForgotMsg('Password updated! Redirecting...');
      setTimeout(() => {
        setShowForgotModal(false);
        setPassword(newPassword);
        setIdentifier(forgotIdentifier);
        setForgotMsg('');
        setOtpSent(false);
      }, 1200);
    } catch (err) {
      setForgotErr(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
      
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 relative z-10 backdrop-blur-xl">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo size="lg" showSubtitle={false} />
          <h1 className="text-xl font-black text-slate-900 dark:text-white mt-3.5 tracking-tight">
            Sign In to SmartTransit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-Time Transit Telematics & Governance
          </p>
        </div>

        {/* Segmented Role Portal Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Account Portal</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1-Click Fast Fill</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {roleConfigs.map((r) => {
              const IconComponent = r.icon;
              const isSelected = activeRole === r.id;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id, r.email)}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all duration-200 ${
                    isSelected
                      ? `bg-white dark:bg-slate-900 ${r.activeColor} shadow-sm scale-102`
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isSelected ? r.iconColor : 'text-slate-400'}`} />
                  <span className="leading-none">{r.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('phoneOrEmail')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setActiveRole('');
                }}
                placeholder="name@transit.com or +9779800000000"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => {
                setForgotIdentifier(identifier);
                setShowForgotModal(true);
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 text-xs shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              {t('signUp')} with OTP
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-emerald-600 mb-2">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Reset Account Password</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Enter your registered email or phone to receive a 6-digit OTP code.</p>

            {forgotMsg && (
              <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotMsg}</span>
              </div>
            )}

            {forgotErr && (
              <div className="mb-3 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotErr}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email or Phone</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="email@domain.com or +977..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    disabled={forgotLoading}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit OTP</label>
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
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
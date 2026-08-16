import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Bus, Lock, User, AlertCircle, Shield, Truck, ArrowRight } from 'lucide-react';

const Login = () => {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('passenger1@transit.com');
  const [password, setPassword] = useState('Password123!');
  const [activeRole, setActiveRole] = useState('passenger');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role, demoIdentifier) => {
    setActiveRole(role);
    setIdentifier(demoIdentifier);
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(identifier, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login identifier or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
        
        <div className="text-center mb-6">
          <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white mx-auto mb-2 shadow-sm">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('signIn')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Smart Transit Guardian Telematics</p>
        </div>

        {/* Demo Fast Account Selector */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('passenger', 'passenger1@transit.com')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                activeRole === 'passenger' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Passenger</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('driver', 'driver1@transit.com')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                activeRole === 'driver' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin', 'admin@transit.com')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                activeRole === 'admin' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
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
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('phoneOrEmail')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setActiveRole('');
                }}
                placeholder="name@transit.com or +9779801234567"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
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
                <span>{t('signIn')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="inline-block bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl transition"
          >
            New User? Create Account with Real Phone / Email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
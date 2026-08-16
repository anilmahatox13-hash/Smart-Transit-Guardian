import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Lock, Mail, AlertCircle, Shield, Truck, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Sign in to your account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Smart Transit Guardian Telematics System</p>
        </div>

        {/* Demo Fast Fill Section */}
        <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">Demo Quick-Fill:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@transit.com')}
              className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-1 transition shadow-2xs"
            >
              <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('driver1@transit.com')}
              className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-1 transition shadow-2xs"
            >
              <Truck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Driver</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('passenger1@transit.com')}
              className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-1 transition shadow-2xs"
            >
              <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>User</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@transit.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
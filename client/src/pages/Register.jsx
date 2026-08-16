import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bus, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'passenger',
    phone: '',
    otp: ''
  });
  const [otpPreview, setOtpPreview] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/send-otp', { email: formData.email });
      setOtpPreview(res.data.otpPreview || '123456');
      setStep(2);
      setTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
        
        <div className="text-center mb-6">
          <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {step === 1 ? 'Create Account' : 'Verify Email Address'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 1 ? 'Join the SmartTransit Fleet Network' : `We sent a 6-digit code to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="passenger">Passenger / Commuter</option>
                <option value="driver">Transit Driver</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm transition flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            {otpPreview && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Demo OTP Code:</p>
                <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 tracking-widest mt-0.5">
                  {otpPreview}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                required
                value={formData.otp}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:underline text-slate-600 dark:text-slate-400"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={timer > 0}
                onClick={handleRequestOtp}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline disabled:text-slate-400 flex items-center space-x-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>{timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length < 6}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Create Account</span>
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
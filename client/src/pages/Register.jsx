import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  RotateCw, 
  AlertCircle, 
  Eye, 
  EyeOff,
  FileCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';

const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+977');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('passenger');

  // Government Verification Document State
  const [idType, setIdType] = useState('Citizenship (Nagarikta)');
  const [idNumber, setIdNumber] = useState('');
  const [issuingDistrict, setIssuingDistrict] = useState('Kathmandu');

  const [otp, setOtp] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (cleanNum.length < 8) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!idNumber.trim()) {
      setError('Please enter your Government ID / Citizenship number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { identifier: fullPhone });
      setOtpPreview(res.data.otpPreview || '');
      setStep(2);
      setTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: fullPhone,
        password,
        role,
        governmentId: {
          idType,
          idNumber: idNumber.trim(),
          issuingDistrictOrAuthority: issuingDistrict.trim()
        },
        otp: otp.trim()
      };

      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 sm:p-8">
        
        <div className="flex flex-col items-center text-center mb-5">
          <BrandLogo size="md" showSubtitle={false} />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-3">
            {step === 1 ? 'Government Verified Sign Up' : 'Verify Security Code'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {step === 1 
              ? 'Enter your mobile number and government identity document' 
              : `Code sent to ${fullPhone}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-3 text-xs">
            
            {/* Role Select */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Category</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-600 focus:outline-none"
              >
                <option value="passenger">Passenger / Commuter</option>
                <option value="operator">Bus Owner / Fleet Operator / Samiti</option>
                <option value="driver">Transit Fleet Driver</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Shrestha"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Phone Input with Country Code Selector */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number</label>
              <div className="flex space-x-1.5">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="+977">🇳🇵 +977</option>
                  <option value="+91">🇮🇳 +91</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9801234567"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Government Identity Document Vault */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1 text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Government Identity Verification (KYC)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">ID Document Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-medium text-slate-900 dark:text-white text-[11px]"
                  >
                    <option value="Citizenship (Nagarikta)">Citizenship (Nagarikta)</option>
                    <option value="Passport">Passport</option>
                    <option value="National ID (NID/Aadhaar)">National ID (NID/Aadhaar)</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Document / ID Number</label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="27-01-78-12345"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-mono text-slate-900 dark:text-white text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Issuing District / Authority</label>
                <input
                  type="text"
                  required
                  value={issuingDistrict}
                  onChange={(e) => setIssuingDistrict(e.target.value)}
                  placeholder="e.g. DAO Kathmandu / Pokhara"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-900 dark:text-white text-[11px]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 mt-4 shadow-sm"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4 text-xs">
            {otpPreview && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 rounded-xl text-center">
                <p className="text-[11px] text-emerald-600 font-semibold">Verification Code:</p>
                <p className="text-xl font-bold font-mono text-emerald-700 tracking-widest mt-0.5">{otpPreview}</p>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <button type="button" onClick={() => setStep(1)} className="hover:underline">← Back</button>
              <button
                type="button"
                disabled={timer > 0}
                onClick={handleRequestOtp}
                className="text-emerald-600 font-semibold disabled:text-slate-400 flex items-center space-x-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>{timer > 0 ? `Resend (${timer}s)` : 'Resend Code'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Complete Registration</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
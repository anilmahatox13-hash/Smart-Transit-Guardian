import React, { useState } from 'react';
import api from '../services/api';
import { 
  Building2, 
  CreditCard, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Smartphone, 
  ShieldCheck 
} from 'lucide-react';

const OwnerPayoutModal = ({ isOpen, onClose, bus, onUpdated }) => {
  if (!isOpen || !bus) return null;

  const current = bus.payoutDetails || {};
  const [bankName, setBankName] = useState(current.bankName || 'Nabil Bank Ltd');
  const [accountNumber, setAccountNumber] = useState(current.accountNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(current.accountHolderName || '');
  const [esewaId, setEsewaId] = useState(current.esewaId || '');
  const [khaltiId, setKhaltiId] = useState(current.khaltiId || '');
  const [upiId, setUpiId] = useState(current.upiId || '');
  const [qrCodeImage, setQrCodeImage] = useState(current.qrCodeImage || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle local QR code image file upload (converts to Base64 data URL)
  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('QR Image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeImage(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.patch(`/buses/${bus._id}/payout`, {
        bankName,
        accountNumber,
        accountHolderName,
        esewaId,
        khaltiId,
        upiId,
        qrCodeImage
      });

      setMessage('Payment details and QR code updated successfully!');
      if (onUpdated) onUpdated(res.data.payoutDetails);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400 mb-1">
          <CreditCard className="w-6 h-6" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Bus Payout & QR Code Settings</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Configure direct passenger fare payments for <span className="font-bold text-slate-800 dark:text-slate-200">{bus.busName}</span> ({bus.busNumber}).
        </p>

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Digital Wallets & UPI */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
              1. Digital Wallets & UPI Addresses
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">eSewa ID / Mobile</label>
                <input
                  type="text"
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  placeholder="9851022334"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Khalti ID</label>
                <input
                  type="text"
                  value={khaltiId}
                  onChange={(e) => setKhaltiId(e.target.value)}
                  placeholder="9851022334"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">UPI ID (India / Nepal)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="transit@upi"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
              2. Bank Account Transfer Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Nabil Bank Ltd, Global IME"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. Dhaulagiri Superline Pvt Ltd"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 01200175008899"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Upload Payment QR Code */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
              3. Upload Official Payment QR Code
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {qrCodeImage ? (
                <div className="relative w-28 h-28 bg-white p-1.5 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center flex-shrink-0">
                  <img src={qrCodeImage} alt="Payment QR" className="w-full h-full object-contain rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setQrCodeImage('')}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="w-full sm:w-48 h-28 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer p-3 text-center transition">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Click to Upload QR</span>
                  <span className="text-[9px] text-slate-400">PNG, JPG up to 2MB</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
              )}

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>Upload your official <b>eSewa, Fonepay, Khalti, or UPI QR code</b>.</p>
                <p>Passengers will scan this exact QR code during checkout to make direct payments into your account.</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Payout & QR Settings</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OwnerPayoutModal;
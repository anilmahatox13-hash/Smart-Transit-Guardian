import React, { useState } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  Bus, 
  MapPin, 
  User, 
  Phone, 
  Calendar 
} from 'lucide-react';

const VerifyTicket = () => {
  const [identifier, setIdentifier] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.get(`/tickets/verify/${identifier.trim()}`);
      setResult(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed: Invalid or counterfeit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ticket Verification Portal</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Conductors and passengers can verify the cryptographic seal and boarding authorization of any transit pass in real time.
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter Ticket No. (e.g. TKT-889123) or HMAC Hash..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition shadow-sm"
        >
          {loading ? 'Verifying...' : 'Verify Pass'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-3xl text-xs flex items-center space-x-3">
          <XCircle className="w-6 h-6 flex-shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">COUNTERFEIT OR INVALID TICKET</p>
            <p className="text-[11px] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-emerald-500 ring-2 ring-emerald-500/20 rounded-3xl shadow-xl space-y-4 animate-in fade-in duration-200">
          
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-mono text-xs font-black text-emerald-600 block">{result.ticketNumber}</span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{result.busName} ({result.busNumber})</h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              ✓ VALID BOARDING PASS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[10px] block">Passenger Details</span>
              <p className="font-bold text-slate-900 dark:text-white">{result.passengerName}</p>
              <p className="font-mono text-slate-500">{result.passengerPhone}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[10px] block">Seat Allocation</span>
              <p className="font-mono font-black text-emerald-600 text-sm">{result.selectedSeats.join(', ')}</p>
              <p className="text-slate-500">{result.totalFare}</p>
            </div>

            <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block">Travel Route</span>
                <p className="font-bold text-slate-900 dark:text-white">{result.route}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Travel Date</span>
                <p className="font-bold text-slate-900 dark:text-white">{result.travelDate}</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default VerifyTicket;
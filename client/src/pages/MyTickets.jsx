import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Ticket, 
  Bus, 
  ShieldCheck, 
  PhoneCall, 
  Printer, 
  Calendar, 
  Clock, 
  QrCode, 
  CheckCircle2, 
  Banknote, 
  CreditCard 
} from 'lucide-react';

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Ticket className="w-6 h-6 text-emerald-600" />
            <span>My Digital Bus Tickets & Passes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as: <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span> ({user?.phone || user?.email})
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-500/20 rounded-xl self-start">
          {tickets.length} Active Bookings
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading verified tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Ticket className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No ticket bookings yet.</p>
          <p className="text-xs text-slate-500">Search active buses on the live map radar to reserve your seats online.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col md:flex-row justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
                      {t.ticketNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{t.busId?.busName}</span>
                    <span className="font-mono text-[11px] text-slate-400">({t.busId?.busNumber})</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    t.paymentStatus === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                  }`}>
                    {t.paymentStatus === 'paid' ? '✓ Paid Online' : '● Pay Cash at Boarding'}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl flex items-center justify-between">
                  <span className="text-emerald-600">{t.originChowk}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-sky-600">{t.destinationChowk}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1">
                  <div>
                    <span className="block text-[10px] text-slate-400">Travel Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{t.travelDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Seats Reserved</span>
                    <span className="font-mono font-black text-emerald-600 text-xs">{t.selectedSeats.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Total Fare</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{t.currency} {t.totalFare}</span>
                  </div>
                </div>
              </div>

              {/* Right QR & Actions */}
              <div className="flex md:flex-col items-center justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4 min-w-[140px] text-center">
                <div className="w-16 h-16 bg-slate-950 p-1 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-full h-full text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm8-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm13-2h3v2h-3v-2zm-3 2h2v3h-2v-3zm3 3h3v3h-3v-3zm-5-1h2v2h-2v-2zm2 3h2v2h-2v-2zM11 3h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                  </svg>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[11px] flex items-center space-x-1 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
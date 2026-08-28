import React, { useState, useEffect } from 'react';
import { X, QrCode, Landmark, Wallet, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const SeatBookingModal = ({ bus, onClose, onBookingComplete }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_boarding');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const rows = 10;
  const seatsPerRow = ['A', 'B', 'C', 'D'];
  const farePerSeat = bus?.baseFare || 500;

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 4) {
        setError('Maximum 4 seats allowed per booking.');
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return setError('Please select at least one seat.');
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/tickets/book', {
        busId: bus._id,
        selectedSeats,
        paymentMethod
      });

      if (res.data.success) {
        onBookingComplete(res.data.ticket);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to booking gateway.');
    } finally {
      setLoading(false);
    }
  };

  const qrData = `smarttransit://pay?amount=${selectedSeats.length * farePerSeat}&bus=${bus?.busNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=064e3b`;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in">
      {/* Scrollable Modal Container with Max Height */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Fixed Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Reserve Seats</h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{bus?.busName} ({bus?.busNumber})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-500 hover:text-rose-600 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex flex-col md:flex-row overflow-y-auto">

          {/* Left Side: Seat Layout */}
          <div className="md:w-1/2 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/30 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-end mb-6 pr-2">
                <div className="w-10 h-10 rounded-full border-[5px] border-slate-300 dark:border-slate-700 flex items-center justify-center"></div>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {seatsPerRow.map((seatLetter, colIndex) => {
                      const seatId = `${seatLetter}${rowIndex + 1}`;
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <div key={seatId} className={`flex items-center justify-center ${colIndex === 1 ? 'mr-4 sm:mr-8' : ''}`}>
                          <button
                            onClick={() => toggleSeat(seatId)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-t-2xl rounded-b-lg text-xs font-bold transition-all duration-200 shadow-sm border-b-[5px] ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-700 text-white transform scale-110 shadow-emerald-500/40'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {seatId}
                          </button>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Payment Gateway */}
          <div className="md:w-1/2 p-4 sm:p-6 bg-white dark:bg-slate-900 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Method</h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('cash_on_boarding')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'cash_on_boarding'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <Wallet className="w-7 h-7" />
                <span className="text-sm font-semibold">Cash / Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('qr_transfer')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'qr_transfer'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <QrCode className="w-7 h-7" />
                <span className="text-sm font-semibold">eSewa / QR</span>
              </button>
            </div>

            {paymentMethod === 'qr_transfer' && (
              <div className="mb-6 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                    <img src={qrUrl} alt="Payment QR" className="w-32 h-32 rounded-xl" />
                  </div>
                </div>
                <div className="flex flex-col items-center text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Landmark className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold">Global IME Bank</span>
                  </div>
                  <span className="font-mono text-xs bg-slate-200 dark:bg-slate-900 py-1.5 px-3 rounded-lg">AC: 1204000987654321</span>
                </div>
              </div>
            )}

            {/* Summary & Checkout Sticky to Bottom of Scrollable Area */}
            <div className="mt-auto bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-sm mb-2 text-slate-600 dark:text-slate-400">
                <span>Selected Seats</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-emerald-600 dark:text-emerald-400 mb-5">
                <span>Total Fare</span>
                <span>NPR {selectedSeats.length * farePerSeat}</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-500 text-xs mb-4 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={loading || selectedSeats.length === 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
              >
                {loading ? 'Processing Transaction...' : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    {paymentMethod === 'qr_transfer' ? 'Confirm Payment & Issue Pass' : 'Book E-Ticket'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingModal;

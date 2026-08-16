import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { 
  Bus, 
  X, 
  QrCode, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Phone, 
  ArrowRight, 
  Lock, 
  Printer, 
  Copy 
} from 'lucide-react';

const SeatBookingModal = ({ isOpen, onClose, bus, onBookingSuccess }) => {
  if (!isOpen || !bus) return null;

  const { user } = useAuth();
  const { currency, country } = useRegion();

  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState(['A2']);
  
  const [passengerName, setPassengerName] = useState(user?.name || '');
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [selectedOriginChowk, setSelectedOriginChowk] = useState(bus.originChowk);
  const [selectedDestChowk, setSelectedDestChowk] = useState(bus.destinationChowk);
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);

  const [paymentMethod, setPaymentMethod] = useState(country === 'India' ? 'phonepe' : 'esewa');
  const [transactionRef, setTransactionRef] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issuedTicket, setIssuedTicket] = useState(null);

  const cleanPhone = passengerPhone.replace(/[\s\-]/g, '');
  const isPhoneValid = cleanPhone.length >= 8;

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const bookedSeatSample = ['A1', 'B3', 'C2', 'D4', 'F1', 'H3'];

  const toggleSeat = (seatId) => {
    if (bookedSeatSample.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        setError('Maximum 6 seats allowed per booking.');
        return;
      }
      setError('');
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const calculatedFare = (bus.baseFare || 500) * selectedSeats.length;

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setPhoneTouched(true);

    if (!passengerName.trim()) {
      setError('Please provide passenger full name.');
      return;
    }
    if (!isPhoneValid) {
      setError('Please enter a valid mobile phone number.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleConfirmAndPay = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/tickets/book', {
        busId: bus._id,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        selectedSeats,
        originChowk: selectedOriginChowk,
        destinationChowk: selectedDestChowk,
        travelDate,
        totalFare: calculatedFare,
        currency: bus.originCountry === 'Nepal' ? 'NPR' : 'INR',
        paymentMethod
      });

      setIssuedTicket(res.data.ticket);
      setStep(4);
      if (onBookingSuccess) onBookingSuccess(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const payout = bus.payoutDetails || {
    esewaId: '9851000000',
    khaltiId: '9851000000',
    upiId: 'transit.operator@upi',
    bankName: 'Nabil Bank / SBI',
    accountNumber: '01200175000000',
    accountHolderName: bus.busName
  };

  const paymentOptions = country === 'India' ? [
    { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-600 text-white', icon: Smartphone },
    { id: 'upi', name: 'GPay / Paytm UPI', color: 'bg-blue-600 text-white', icon: QrCode },
    { id: 'mobile_banking', name: 'Net Banking', color: 'bg-slate-800 text-white', icon: CreditCard },
    { id: 'cash_on_boarding', name: 'Cash on Boarding', color: 'bg-emerald-600 text-white', icon: Banknote }
  ] : [
    { id: 'esewa', name: 'eSewa Wallet', color: 'bg-emerald-600 text-white', icon: Smartphone },
    { id: 'khalti', name: 'Khalti Wallet', color: 'bg-purple-600 text-white', icon: Smartphone },
    { id: 'mobile_banking', name: 'Fonepay / Bank QR', color: 'bg-rose-600 text-white', icon: QrCode },
    { id: 'cash_on_boarding', name: 'Cash on Boarding', color: 'bg-slate-800 text-white', icon: Banknote }
  ];

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400 mb-1">
          <Bus className="w-6 h-6" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {step === 4 ? 'Digital Boarding Pass' : 'Seat Booking & Payment Gateway'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {bus.busName} ({bus.busNumber}) • {bus.originChowk} ➔ {bus.destinationChowk}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: SEAT MAP */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="max-w-xs mx-auto p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-3 font-semibold text-slate-400">
                <span>Entry</span>
                <span className="text-emerald-600">● Driver</span>
              </div>

              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row} className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {[1, 2].map((num) => {
                        const seatId = `${row}${num}`;
                        const isBooked = bookedSeatSample.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);

                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={isBooked}
                            onClick={() => toggleSeat(seatId)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center ${
                              isBooked
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <div className="flex space-x-2">
                      {[3, 4].map((num) => {
                        const seatId = `${row}${num}`;
                        const isBooked = bookedSeatSample.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);

                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={isBooked}
                            onClick={() => toggleSeat(seatId)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center ${
                              isBooked
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
              <div>
                <span className="text-slate-500 font-medium">Selected Seats:</span>
                <p className="font-mono font-bold text-emerald-600">{selectedSeats.join(', ') || 'None'}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium">Total Fare:</span>
                <p className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                  {bus.originCountry === 'Nepal' ? 'NPR' : 'INR'} {calculatedFare}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() => setStep(2)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center space-x-2"
            >
              <span>Continue to Passenger Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PASSENGER DETAILS */}
        {step === 2 && (
          <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Passenger Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Ramesh Shrestha"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={passengerPhone}
                  onBlur={() => setPhoneTouched(true)}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="+977 9801234567"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Boarding Chowk</label>
                <input
                  type="text"
                  required
                  value={selectedOriginChowk}
                  onChange={(e) => setSelectedOriginChowk(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dropping Chowk</label>
                <input
                  type="text"
                  required
                  value={selectedDestChowk}
                  onChange={(e) => setSelectedDestChowk(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-sky-600"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT GATEWAYS (ESEWA, KHALTI, UPI, PHONEPE, BANK, CASH) */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-slate-500">Payable to Operator</span>
                <p className="text-xl font-extrabold text-emerald-600 font-mono">
                  {bus.originCountry === 'Nepal' ? 'NPR' : 'INR'} {calculatedFare}
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Reserved Seats</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedSeats.join(', ')}</p>
              </div>
            </div>

            {/* Gateway Grid */}
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((gw) => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setPaymentMethod(gw.id)}
                  className={`p-2.5 rounded-2xl border text-left font-bold flex items-center space-x-2 transition ${
                    paymentMethod === gw.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${gw.color}`}>
                    <gw.icon className="w-4 h-4" />
                  </div>
                  <span>{gw.name}</span>
                </button>
              ))}
            </div>

            {/* QR / Bank Transfer Details */}
            {paymentMethod !== 'cash_on_boarding' && (
              <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Operator Verified Account
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{paymentMethod.toUpperCase()} Direct</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Account Name</span>
                      <p className="font-bold">{payout.accountHolderName || bus.busName}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Bank / Wallet ID</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-emerald-400">{payout.accountNumber || payout.esewaId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(payout.accountNumber || payout.esewaId, 'acc')}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="w-24 h-24 bg-white p-1.5 rounded-lg flex items-center justify-center">
                      <svg className="w-full h-full text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm8-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm13-2h3v2h-3v-2zm-3 2h2v3h-2v-3zm3 3h3v3h-3v-3zm-5-1h2v2h-2v-2zm2 3h2v2h-2v-2zM11 3h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                      </svg>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">Scan with {paymentMethod.toUpperCase()}</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter Transaction Ref ID (Optional)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-2xl"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmAndPay}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{paymentMethod === 'cash_on_boarding' ? 'Reserve Seat & Pay Cash' : 'Verify & Generate Ticket'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BOARDING PASS */}
        {step === 4 && issuedTicket && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">Verified Boarding Pass</span>
                  <h3 className="font-extrabold text-base text-white">{issuedTicket.busId?.busName || bus.busName}</h3>
                  <span className="font-mono text-slate-400 text-xs">{issuedTicket.busId?.busNumber || bus.busNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Ticket No.</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">{issuedTicket.ticketNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Passenger</span>
                  <p className="font-bold">{issuedTicket.passengerName}</p>
                  <p className="text-slate-400 font-mono text-[10px]">{issuedTicket.passengerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Seats</span>
                  <p className="font-mono font-bold text-emerald-400 text-sm">{issuedTicket.selectedSeats.join(', ')}</p>
                </div>
                <div className="col-span-2 bg-slate-800/60 p-2 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Route</span>
                    <p className="font-bold">{issuedTicket.originChowk} ➔ {issuedTicket.destinationChowk}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Fare</span>
                    <p className="font-mono font-bold text-white">{issuedTicket.currency} {issuedTicket.totalFare}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-800 text-[10px]">
                <span className="text-emerald-400 font-semibold">Payment: {issuedTicket.paymentMethod.toUpperCase()} ({issuedTicket.paymentStatus})</span>
                <span className="font-mono text-slate-500">Hash: {issuedTicket.verificationHash?.slice(0, 10)}...</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatBookingModal;
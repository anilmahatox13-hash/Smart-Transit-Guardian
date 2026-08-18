import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';

const SeatBookingModal = ({ isOpen, onClose, bus, onBookingSuccess }) => {
  if (!isOpen || !bus) return null;

  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency, country } = useRegion();

  const [step, setStep] = useState(1); // 1: Seat Map, 2: Passenger Info, 3: Payment Choice, 4: Digital Pass
  const [selectedSeats, setSelectedSeats] = useState(['A2']);
  
  // Passenger Info
  const [passengerName, setPassengerName] = useState(user?.name || '');
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '');
  const [selectedOriginChowk, setSelectedOriginChowk] = useState(
    bus.originChowk || bus.originDistrict || bus.origin || 'Starting Hub'
  );
  const [selectedDestChowk, setSelectedDestChowk] = useState(
    bus.destinationChowk || bus.destDistrict || bus.destination || 'Destination Hub'
  );
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Method Selection
  const defaultMethod = country === 'India' ? 'phonepe' : 'esewa';
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issuedTicket, setIssuedTicket] = useState(null);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const bookedSeatSample = ['A1', 'B3', 'C2', 'D4', 'F1'];

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

  const farePerSeat = bus.baseFare || bus.fare || 500;
  const calculatedFare = farePerSeat * selectedSeats.length;
  const ownerPayout = bus.payoutDetails || {};

  // Step 1 -> Step 2
  const handleProceedToDetails = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  // Step 2 -> Step 3
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!passengerName.trim()) {
      setError('Please enter passenger full legal name.');
      return;
    }
    if (!passengerPhone.trim() || passengerPhone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid contact phone number.');
      return;
    }
    setError('');
    setStep(3);
  };

  // Step 3 -> Step 4: Confirm Booking & Pay
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
        currency,
        paymentMethod
      });

      setIssuedTicket(res.data.ticket);
      setStep(4);
      if (onBookingSuccess) onBookingSuccess(res.data.ticket);
    } catch (err) {
      console.error('Booking Error:', err);
      setError(err.response?.data?.message || 'Booking submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Payment Gateway Definitions
  const paymentGateways = country === 'India' ? [
    { 
      id: 'phonepe', 
      name: 'PhonePe UPI', 
      color: 'bg-purple-600 text-white', 
      icon: Smartphone,
      btnLabel: `Pay with PhonePe (${currency} ${calculatedFare})`,
      btnClass: 'bg-purple-600 hover:bg-purple-700'
    },
    { 
      id: 'upi', 
      name: 'GPay / Paytm UPI QR', 
      color: 'bg-blue-600 text-white', 
      icon: QrCode,
      btnLabel: `Verify UPI QR & Pay (${currency} ${calculatedFare})`,
      btnClass: 'bg-blue-600 hover:bg-blue-700'
    },
    { 
      id: 'mobile_banking', 
      name: 'Net Banking Transfer', 
      color: 'bg-slate-800 text-white', 
      icon: CreditCard,
      btnLabel: `Confirm Bank Transfer & Issue Ticket`,
      btnClass: 'bg-slate-800 hover:bg-slate-900'
    },
    { 
      id: 'cash_on_boarding', 
      name: 'Cash on Boarding', 
      color: 'bg-emerald-600 text-white', 
      icon: Banknote,
      btnLabel: `Confirm Ticket & Pay Cash (${currency} ${calculatedFare})`,
      btnClass: 'bg-emerald-600 hover:bg-emerald-700'
    }
  ] : [
    { 
      id: 'esewa', 
      name: 'eSewa Wallet', 
      color: 'bg-emerald-600 text-white', 
      icon: Smartphone,
      btnLabel: `Pay via eSewa (${currency} ${calculatedFare})`,
      btnClass: 'bg-emerald-600 hover:bg-emerald-700'
    },
    { 
      id: 'khalti', 
      name: 'Khalti Wallet', 
      color: 'bg-purple-600 text-white', 
      icon: Smartphone,
      btnLabel: `Pay via Khalti (${currency} ${calculatedFare})`,
      btnClass: 'bg-purple-600 hover:bg-purple-700'
    },
    { 
      id: 'mobile_banking', 
      name: 'Fonepay / Bank QR', 
      color: 'bg-rose-600 text-white', 
      icon: QrCode,
      btnLabel: `Confirm Bank Transfer & Issue Ticket`,
      btnClass: 'bg-rose-600 hover:bg-rose-700'
    },
    { 
      id: 'cash_on_boarding', 
      name: 'Cash on Boarding', 
      color: 'bg-slate-800 text-white', 
      icon: Banknote,
      btnLabel: `Confirm Ticket & Pay Cash (${currency} ${calculatedFare})`,
      btnClass: 'bg-slate-800 hover:bg-slate-900'
    }
  ];

  // Active Gateway Config
  const activeGateway = paymentGateways.find(g => g.id === paymentMethod) || paymentGateways[0];
  const ActiveIcon = activeGateway.icon;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1">
          <Bus className="w-6 h-6" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {step === 4 ? 'Verified Digital Boarding Pass' : 'Seat Booking & Checkout'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {bus.busName} ({bus.busNumber}) • {bus.originDistrict || bus.origin} ➔ {bus.destDistrict || bus.destination}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-5 px-1">
          {['1. Select Seats', '2. Passenger Info', '3. Payment Method', '4. Boarding Pass'].map((label, idx) => (
            <div key={idx} className="flex items-center space-x-1">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                step > idx + 1 
                  ? 'bg-emerald-600 text-white' 
                  : step === idx + 1 
                    ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500 font-bold' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {step > idx + 1 ? '✓' : idx + 1}
              </span>
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-600 dark:text-slate-400">{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: SEAT SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4 text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px]">✓</div>
                <span>Selected</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-[9px]">✕</div>
                <span>Booked</span>
              </div>
            </div>

            <div className="max-w-xs mx-auto p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700/80">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-3 text-[11px] text-slate-400 font-semibold px-2">
                <span>Entry Door</span>
                <span className="font-mono text-emerald-600 font-bold">Driver Cabin</span>
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
                                  ? 'bg-emerald-600 text-white shadow-md scale-105'
                                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                            }`}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600">| |</span>

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
                                  ? 'bg-emerald-600 text-white shadow-md scale-105'
                                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
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

            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
              <div>
                <span className="text-[11px] text-slate-500 block">Seats Selected ({selectedSeats.length})</span>
                <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Total Fare</span>
                <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                  {currency} {calculatedFare}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={handleProceedToDetails}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Continue to Passenger Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PASSENGER FORM */}
        {step === 2 && (
          <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Passenger Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Anil Mahato"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="e.g. 9801234567"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Boarding Chowk / Stop</label>
                <input
                  type="text"
                  required
                  value={selectedOriginChowk}
                  onChange={(e) => setSelectedOriginChowk(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dropping Chowk / Stop</label>
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
                className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DYNAMIC PAYMENT WITH METHOD-SPECIFIC BUTTONS */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500">Payable Total</span>
                <p className="text-xl font-extrabold text-emerald-600 font-mono">{currency} {calculatedFare}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Seats</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedSeats.join(', ')}</p>
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {paymentGateways.map((gw) => {
                  const IconComp = gw.icon;
                  const isSelected = paymentMethod === gw.id;

                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setPaymentMethod(gw.id)}
                      className={`p-3 rounded-2xl border text-left font-bold flex items-center space-x-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${gw.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs">{gw.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash on Boarding Instruction Card */}
            {paymentMethod === 'cash_on_boarding' ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-amber-800 dark:text-amber-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold">
                  <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Cash Payment on Vehicle Boarding</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Your seat(s) <b>{selectedSeats.join(', ')}</b> will be reserved immediately. Please pay <b>{currency} {calculatedFare}</b> in cash directly to the bus conductor upon boarding.
                </p>
              </div>
            ) : (
              /* Online / QR Gateway Card */
              <div className="p-4 bg-slate-900 text-white rounded-3xl text-center space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" /> Direct Bus Fleet Gateway
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">Verified Account</span>
                </div>

                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg">
                  {ownerPayout.qrCodeImage ? (
                    <img src={ownerPayout.qrCodeImage} alt="Owner Payment QR" className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <QrCode className="w-full h-full text-slate-900" />
                  )}
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-2xl text-[11px] space-y-1 text-slate-300 text-left">
                  {ownerPayout.esewaId && <p>📱 <b>eSewa / Khalti:</b> {ownerPayout.esewaId}</p>}
                  {ownerPayout.upiId && <p>⚡ <b>UPI ID:</b> {ownerPayout.upiId}</p>}
                  <p>🏦 <b>Bank:</b> {ownerPayout.bankName || 'Bus Operator Fleet Account'}</p>
                  {ownerPayout.accountNumber && (
                    <p className="font-mono">💳 <b>A/C:</b> {ownerPayout.accountNumber} ({ownerPayout.accountHolderName})</p>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Confirmation Button */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-2xl cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmAndPay}
                className={`w-2/3 ${activeGateway.btnClass} text-white font-bold py-3 rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer`}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ActiveIcon className="w-4 h-4" />
                    <span>{activeGateway.btnLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFIED BOARDING PASS */}
        {step === 4 && issuedTicket && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl space-y-3">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    Digital Boarding Pass
                  </span>
                  <h3 className="font-extrabold text-base text-white">{issuedTicket.busId?.busName || bus.busName}</h3>
                  <span className="font-mono text-slate-400 text-xs">{issuedTicket.busId?.busNumber || bus.busNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Ticket No.</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">{issuedTicket.ticketNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Passenger</span>
                  <p className="font-bold text-slate-200">{issuedTicket.passengerName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Seats</span>
                  <p className="font-mono font-black text-emerald-400 text-sm">{issuedTicket.selectedSeats?.join(', ')}</p>
                </div>
                <div className="col-span-2 bg-slate-800/60 p-2 rounded-xl flex justify-between">
                  <span>Route: {issuedTicket.originChowk} ➔ {issuedTicket.destinationChowk}</span>
                  <span className="font-bold font-mono text-white">{issuedTicket.currency} {issuedTicket.totalFare}</span>
                </div>
                <div className="col-span-2 flex justify-between text-[11px] text-slate-400">
                  <span>Payment: <b className="text-emerald-400 uppercase">{issuedTicket.paymentMethod?.replace('_', ' ')}</b></span>
                  <span>Status: <b className="text-emerald-400 uppercase">{issuedTicket.paymentStatus}</b></span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
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
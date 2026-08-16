import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import api from '../services/api';
import { 
  Bus, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Plus, 
  FileText, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  X, 
  Trash2, 
  UserPlus, 
  Users, 
  Phone, 
  Award,
  Lock
} from 'lucide-react';

const OperatorHub = () => {
  const { user } = useAuth();
  const { currency } = useRegion();
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [payoutModalBus, setPayoutModalBus] = useState(null);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Bus Registration Form State
  const [formData, setFormData] = useState({
    busName: 'Dhaulagiri Superline',
    busNumber: '',
    registrationNumber: '',
    originCountry: 'Nepal',
    originProvince: 'Bagmati Province',
    originDistrict: 'Kathmandu',
    originChowk: 'Gongabu New Bus Park',
    destCountry: 'Nepal',
    destProvince: 'Gandaki Province',
    destDistrict: 'Kaski (Pokhara)',
    destinationChowk: 'Prithvi Chowk',
    busType: 'AC Deluxe',
    baseFare: 750,
    capacity: 40,
    contactPhone: user?.phone || '+977 9851000000',
    driverId: '',
    bluebookNumber: '',
    routePermitNumber: '',
    permitValidityZone: 'Kathmandu - Pokhara Highway Corridor',
    insurancePolicyNumber: ''
  });

  // Driver Onboarding Form State (Owner Recruits Driver)
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    password: 'Password123!',
    licenseNumber: '',
    licenseCategory: 'Heavy Vehicle (Category B/G)',
    citizenshipNumber: '',
    issuingDistrict: 'Kathmandu',
    yearsOfExperience: 5
  });

  // Payout Editor State
  const [payoutForm, setPayoutForm] = useState({
    esewaId: '',
    khaltiId: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    qrCodeUrl: ''
  });

  const [intermediateChowks, setIntermediateChowks] = useState([
    { name: 'Kalanki Chowk', district: 'Kathmandu', minutes: 20, fare: 50 },
    { name: 'Mugling Bazaar Chowk', district: 'Chitwan', minutes: 180, fare: 450 }
  ]);

  const fetchOperatorFleet = async () => {
    try {
      const [busRes, driverRes] = await Promise.all([
        api.get('/buses/operator/my-fleet'),
        api.get('/auth/drivers')
      ]);
      setBuses(busRes.data.buses || []);
      setDrivers(driverRes.data.drivers || []);
      if (driverRes.data.drivers?.length > 0 && !formData.driverId) {
        setFormData(prev => ({ ...prev, driverId: driverRes.data.drivers[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorFleet();
  }, []);

  const handleAddChowk = () => {
    setIntermediateChowks([...intermediateChowks, { name: '', district: formData.originDistrict, minutes: 45, fare: 100 }]);
  };

  const handleRemoveChowk = (index) => {
    setIntermediateChowks(intermediateChowks.filter((_, i) => i !== index));
  };

  const handleChowkChange = (index, field, value) => {
    const updated = [...intermediateChowks];
    updated[index][field] = value;
    setIntermediateChowks(updated);
  };

  const estimatedDistKm = 200 + intermediateChowks.length * 20;
  const estimatedMaxLegalCap = Math.round((30 + estimatedDistKm * 2.90) * 1.40 * 1.10 / 10) * 10;
  const isOvercharging = Number(formData.baseFare) > estimatedMaxLegalCap;

  const handleSubmitBus = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isOvercharging) {
      setError(`Price gouging violation: Entered fare of ${currency} ${formData.baseFare} exceeds legal ceiling of ${currency} ${estimatedMaxLegalCap}.`);
      return;
    }

    try {
      const defaultOriginCoords = [85.3120, 27.7340];
      const defaultDestCoords = [83.9856, 28.2096];

      const fullRouteChowks = [
        { name: formData.originChowk, district: formData.originDistrict, sequence: 1, coordinates: defaultOriginCoords, estimatedMinutesFromStart: 0, fareFromStart: 0 },
        ...intermediateChowks.map((c, i) => ({
          name: c.name,
          district: c.district || formData.originDistrict,
          sequence: i + 2,
          coordinates: [defaultOriginCoords[0] + (i + 1) * 0.05, defaultOriginCoords[1] + (i + 1) * 0.05],
          estimatedMinutesFromStart: Number(c.minutes) || 30,
          fareFromStart: Number(c.fare) || 50
        })),
        { name: formData.destinationChowk, district: formData.destDistrict, sequence: intermediateChowks.length + 2, coordinates: defaultDestCoords, estimatedMinutesFromStart: 320, fareFromStart: Number(formData.baseFare) }
      ];

      await api.post('/buses', {
        ...formData,
        routeChowks: fullRouteChowks
      });

      setMessage('Bus registered and submitted for KYC verification.');
      setModalOpen(false);
      fetchOperatorFleet();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register bus.');
    }
  };

  const handleOnboardDriver = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/auth/operator/create-driver', driverForm);
      setMessage(`Driver ${driverForm.name} onboarded with Heavy License & Citizenship KYC!`);
      setDriverModalOpen(false);
      setDriverForm({
        name: '',
        phone: '',
        password: 'Password123!',
        licenseNumber: '',
        licenseCategory: 'Heavy Vehicle (Category B/G)',
        citizenshipNumber: '',
        issuingDistrict: 'Kathmandu',
        yearsOfExperience: 5
      });
      fetchOperatorFleet();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to onboard driver.');
    }
  };

  const handleOpenPayoutModal = (bus) => {
    setPayoutModalBus(bus);
    setPayoutForm({
      esewaId: bus.payoutDetails?.esewaId || '',
      khaltiId: bus.payoutDetails?.khaltiId || '',
      upiId: bus.payoutDetails?.upiId || '',
      bankName: bus.payoutDetails?.bankName || '',
      accountNumber: bus.payoutDetails?.accountNumber || '',
      accountHolderName: bus.payoutDetails?.accountHolderName || '',
      qrCodeUrl: bus.payoutDetails?.qrCodeUrl || ''
    });
  };

  const handleSavePayoutDetails = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/buses/${payoutModalBus._id}`, {
        payoutDetails: payoutForm
      });
      setMessage('Payment QR and Bank Details updated for this vehicle.');
      setPayoutModalBus(null);
      fetchOperatorFleet();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment details.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bus Owner Fleet & Driver Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Company: <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span> • Government KYC Verified Operator
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDriverModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard & Recruit Driver</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vehicle (KYC)</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Recruited Drivers Roster */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Your Recruited & Verified Fleet Drivers ({drivers.length})</span>
          </h2>
          <span className="text-[11px] text-slate-400">Drivers hired under your Samiti / Company</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {drivers.map(d => (
            <div key={d._id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 dark:text-white">{d.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-[10px]">
                  ✓ KYC Verified
                </span>
              </div>
              <p className="text-slate-500 font-mono">📱 {d.phone}</p>
              <p className="text-slate-600 dark:text-slate-300">🪪 License: <span className="font-mono font-semibold">{d.driverKyc?.licenseNumber || 'Verified B/G'}</span></p>
              <p className="text-slate-500 text-[10px]">Citizenship: {d.governmentId?.idNumber || 'Verified'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Fleet Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Active Fleet Vehicles & Assigned Drivers</h2>
          <span className="text-xs text-slate-400">{buses.length} vehicles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Bus Name & Plate</th>
                <th className="p-3.5">Corridor Route</th>
                <th className="p-3.5">Assigned Recruited Driver</th>
                <th className="p-3.5">Payment Setup (QR/Bank)</th>
                <th className="p-3.5">KYC Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {buses.map((bus) => (
                <tr key={bus._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{bus.busName}</p>
                    <span className="font-mono text-slate-400 text-[11px]">{bus.busNumber} • {bus.registrationNumber}</span>
                  </td>
                  <td className="p-3.5">
                    <p className="text-emerald-600 font-semibold">{bus.originDistrict} ➔ {bus.destDistrict}</p>
                    <span className="text-[11px] text-slate-400">Fare: {currency} {bus.baseFare}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{bus.driverId?.name || 'Unassigned'}</span>
                    <p className="text-[10px] text-slate-500 font-mono">{bus.driverId?.phone || 'Select driver'}</p>
                  </td>
                  <td className="p-3.5 text-[11px]">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{bus.payoutDetails?.bankName || 'Nabil Bank'}</p>
                    <p className="font-mono text-slate-500">A/C: {bus.payoutDetails?.accountNumber || '01200...'}</p>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      bus.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}>
                      {bus.verificationStatus === 'verified' ? '✓ Verified' : '● Pending KYC'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenPayoutModal(bus)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-100 transition inline-flex items-center space-x-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Set QR & Bank</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRIVER ONBOARDING MODAL */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setDriverModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-600 mb-1">
              <UserPlus className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recruit & Onboard Verified Driver</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Register your company's heavy vehicle driver with complete government KYC.</p>

            <form onSubmit={handleOnboardDriver} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Full Name</label>
                <input
                  type="text"
                  required
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  placeholder="e.g. Shyam Bahadur Gurung"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  placeholder="+977 9841000000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Heavy License No.</label>
                  <input
                    type="text"
                    required
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    placeholder="01-06-887766"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Citizenship No.</label>
                  <input
                    type="text"
                    required
                    value={driverForm.citizenshipNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, citizenshipNumber: e.target.value })}
                    placeholder="27-01-72-9988"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Issuing District</label>
                  <input
                    type="text"
                    required
                    value={driverForm.issuingDistrict}
                    onChange={(e) => setDriverForm({ ...driverForm, issuingDistrict: e.target.value })}
                    placeholder="Kathmandu / Kaski"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Login Password</label>
                  <input
                    type="text"
                    required
                    value={driverForm.password}
                    onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-2xl transition shadow-md mt-2"
              >
                Confirm Driver Onboarding (KYC)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT QR & BANK MODAL */}
      {payoutModalBus && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setPayoutModalBus(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <CreditCard className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Owner Payment QR & Bank Setup</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Configure where passengers will transfer fares when booking seats on {payoutModalBus.busName}.
            </p>

            <form onSubmit={handleSavePayoutDetails} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={payoutForm.bankName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                  placeholder="e.g. Nabil Bank, Global IME, SBI"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  required
                  value={payoutForm.accountHolderName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">eSewa / Khalti Mobile</label>
                  <input
                    type="text"
                    value={payoutForm.esewaId}
                    onChange={(e) => setPayoutForm({ ...payoutForm, esewaId: e.target.value, khaltiId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">UPI ID (India)</label>
                  <input
                    type="text"
                    value={payoutForm.upiId}
                    onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition shadow-md mt-2"
              >
                Save Payment Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Bus Registration & KYC Verification</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Submit vehicle proofs and select your recruited driver.</p>

            <form onSubmit={handleSubmitBus} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bus Line Name</label>
                  <input
                    type="text"
                    required
                    value={formData.busName}
                    onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bus Code Number</label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    placeholder="BA-01-KHA-8822"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Plate Number</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="BA 2 KHA 8822"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              {/* Select Recruited Driver */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assign Recruited Fleet Driver</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-semibold text-amber-600"
                >
                  <option value="">-- Select Recruited Driver --</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.phone}) - Lic: {d.driverKyc?.licenseNumber || 'Verified'}</option>
                  ))}
                </select>
              </div>

              {/* KYC Vault */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Mandatory Transport Authority KYC Documents</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Bluebook (RC) No.</label>
                    <input
                      type="text"
                      required
                      value={formData.bluebookNumber}
                      onChange={(e) => setFormData({ ...formData, bluebookNumber: e.target.value })}
                      placeholder="BB-98421-KTM"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Route Permit No.</label>
                    <input
                      type="text"
                      required
                      value={formData.routePermitNumber}
                      onChange={(e) => setFormData({ ...formData, routePermitNumber: e.target.value })}
                      placeholder="RP-2024-889"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Passenger Insurance No.</label>
                    <input
                      type="text"
                      required
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                      placeholder="INS-7788992"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fare */}
              <div>
                <label className="font-semibold block mb-1">Proposed Passenger Fare ({currency})</label>
                <input
                  type="number"
                  required
                  value={formData.baseFare}
                  onChange={(e) => setFormData({ ...formData, baseFare: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-base"
                />
              </div>

              <button
                type="submit"
                disabled={isOvercharging}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition shadow-md"
              >
                Submit Vehicle for Transport Authority Approval
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorHub;
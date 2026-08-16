import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LiveMap from '../components/LiveMap';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import { REGION_DATA } from '../data/regions';
import { 
  Bus, 
  MapPin, 
  PhoneCall, 
  Search, 
  RotateCcw, 
  Star, 
  Users, 
  ShieldAlert, 
  Radio, 
  Share2,
  PackageSearch,
  CheckCircle2, 
  X,
  CreditCard
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const { country, province, district, currency } = useRegion();
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chowk Search State
  const [originChowk, setOriginChowk] = useState('');
  const [destChowk, setDestChowk] = useState('');
  const [busTypeFilter, setBusTypeFilter] = useState('all');

  // Lost and Found Modal
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostBus, setLostBus] = useState(null);
  const [lostForm, setLostForm] = useState({ passengerName: '', passengerPhone: '', itemDescription: '', chowkLost: '', travelDate: new Date().toISOString().split('T')[0] });
  const [lostSuccess, setLostSuccess] = useState(false);

  // Simulated QR Payment Modal
  const [payModalBus, setPayModalBus] = useState(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country,
        stateProvince: province,
        ...(busTypeFilter !== 'all' && { busType: busTypeFilter }),
        ...(originChowk && { originChowk }),
        ...(destChowk && { destinationChowk })
      });
      const res = await api.get(`/buses?${params.toString()}`);
      setBuses(res.data.buses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 5000);
    return () => clearInterval(interval);
  }, [country, province, district, busTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBuses();
  };

  const handleReset = () => {
    setOriginChowk('');
    setDestChowk('');
    setBusTypeFilter('all');
    fetchBuses();
  };

  const handleLostSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/buses/lost-found', { ...lostForm, busId: lostBus._id });
      setLostSuccess(true);
      setTimeout(() => {
        setLostSuccess(false);
        setLostModalOpen(false);
        setLostForm({ passengerName: '', passengerPhone: '', itemDescription: '', chowkLost: '', travelDate: new Date().toISOString().split('T')[0] });
      }, 1500);
    } catch (err) {
      alert('Failed to report lost item');
    }
  };

  const popularChowks = REGION_DATA[country]?.popularChowks || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      
      {/* Chowk Search & Fare Estimator Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <span>📍 Chowk-to-Chowk Commuter Route Planner</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">{country} Coverage Active</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* Origin Chowk with Autocomplete Datalsit */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Boarding Chowk / Stop</label>
            <input
              type="text"
              list="origin-chowk-list"
              placeholder="e.g. Kalanki Chowk, Gongabu..."
              value={originChowk}
              onChange={(e) => setOriginChowk(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <datalist id="origin-chowk-list">
              {popularChowks.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Destination Chowk */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Dropping Chowk / Landmark</label>
            <input
              type="text"
              list="dest-chowk-list"
              placeholder="e.g. Prithvi Chowk, Mugling..."
              value={destChowk}
              onChange={(e) => setDestChowk(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <datalist id="dest-chowk-list">
              {popularChowks.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Bus Type */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Vehicle Category</label>
            <select
              value={busTypeFilter}
              onChange={(e) => setBusTypeFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Fleet Types</option>
              <option value="AC Deluxe">AC Deluxe</option>
              <option value="Super Deluxe">Super Deluxe</option>
              <option value="Sleeper Coach">Sleeper Coach</option>
              <option value="Express">Express</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Buses</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Main Dual Grid: Bus Radar Cards + Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Bus Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col h-[580px] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-xs text-slate-900 dark:text-white">Active Buses on Radar</span>
            <span className="text-[11px] text-slate-400 font-mono">{buses.length} tracked</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {buses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                <Bus className="w-8 h-8 text-slate-300 mb-2" />
                <p>No active buses found for this Chowk filter.</p>
                <button onClick={handleReset} className="text-emerald-600 underline mt-2 font-medium">
                  Clear Filters & Show All
                </button>
              </div>
            ) : (
              buses.map((bus) => {
                const isSelected = selectedBus?._id === bus._id;
                const activeDriver = bus.isDriverAbsent ? bus.substituteDriverId : bus.driverId;
                const driverPhone = activeDriver?.phone || bus.contactPhone;

                const getCrowdBadge = (crowd) => {
                  switch (crowd) {
                    case 'full':
                      return { label: '🔴 Full / Packed', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' };
                    case 'moderate':
                      return { label: '🟡 Standing Only', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' };
                    default:
                      return { label: '🟢 Seats Available', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' };
                  }
                };
                const crowd = getCrowdBadge(bus.crowdStatus);

                return (
                  <div
                    key={bus._id}
                    onClick={() => setSelectedBus(bus)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col space-y-2.5 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                          <Bus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{bus.busNumber}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{bus.busName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {currency} {bus.baseFare}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md block mt-0.5 ${crowd.bg}`}>
                          {crowd.label}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl flex items-center justify-between">
                      <span className="text-emerald-600 truncate">{bus.originChowk}</span>
                      <span className="text-slate-400 px-1">➔</span>
                      <span className="text-sky-600 truncate">{bus.destinationChowk}</span>
                    </div>

                    {/* Driver Contact & Lost Item Reporting */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="text-[11px] text-slate-500">
                        <span>Driver: {activeDriver?.name || 'Assigned Driver'}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {driverPhone && (
                          <a
                            href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center space-x-1 shadow-2xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLostBus(bus);
                            setLostModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Report Lost Item"
                        >
                          <PackageSearch className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Map Canvas */}
        <div className="lg:col-span-2">
          <LiveMap
            buses={buses}
            selectedBus={selectedBus}
            onSelectBus={setSelectedBus}
            country={country}
          />
        </div>
      </div>

      {/* Lost and Found Modal */}
      {lostModalOpen && lostBus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setLostModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-500 mb-2">
              <PackageSearch className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Report Lost Item</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Bus {lostBus.busNumber} • {lostBus.originChowk} ➔ {lostBus.destinationChowk}
            </p>

            {lostSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ticket registered. Driver and operator notified.</span>
              </div>
            ) : (
              <form onSubmit={handleLostSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={lostForm.passengerName}
                    onChange={(e) => setLostForm({ ...lostForm, passengerName: e.target.value })}
                    placeholder="Anil Mahato"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={lostForm.passengerPhone}
                    onChange={(e) => setLostForm({ ...lostForm, passengerPhone: e.target.value })}
                    placeholder="+977 9800000000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Chowk / Landmark Dropped</label>
                  <input
                    type="text"
                    required
                    value={lostForm.chowkLost}
                    onChange={(e) => setLostForm({ ...lostForm, chowkLost: e.target.value })}
                    placeholder="Near Kalanki Chowk"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Item Description</label>
                  <textarea
                    rows={2}
                    required
                    value={lostForm.itemDescription}
                    onChange={(e) => setLostForm({ ...lostForm, itemDescription: e.target.value })}
                    placeholder="Black backpack with laptop, wallet on seat 14..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-xl text-xs transition"
                >
                  Submit Lost Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
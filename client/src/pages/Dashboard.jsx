import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LiveMap from '../components/LiveMap';
import AddBusModal from '../components/AddBusModal';
import SeatBookingModal from '../components/SeatBookingModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import { REGION_DATA } from '../data/regions';
import { 
  Bus, 
  MapPin, 
  PhoneCall, 
  Search, 
  RotateCcw, 
  Plus, 
  Radio, 
  PackageSearch, 
  CheckCircle2, 
  X, 
  Ticket 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { country, province, district, currency } = useRegion();
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search States
  const [originChowk, setOriginChowk] = useState('');
  const [destChowk, setDestChowk] = useState('');
  const [busTypeFilter, setBusTypeFilter] = useState('all');

  // Booking & Add Bus Modals
  const [isAddBusModalOpen, setIsAddBusModalOpen] = useState(false);
  const [bookingBus, setBookingBus] = useState(null);

  // Lost Item Modal
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostBus, setLostBus] = useState(null);
  const [lostForm, setLostForm] = useState({ 
    passengerName: user?.name || '', 
    passengerPhone: user?.phone || '', 
    itemDescription: '', 
    chowkLost: '', 
    travelDate: new Date().toISOString().split('T')[0] 
  });
  const [lostSuccess, setLostSuccess] = useState(false);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country,
        stateProvince: province,
        ...(busTypeFilter !== 'all' && { busType: busTypeFilter }),
        ...(originChowk.trim() && { originChowk: originChowk.trim() }),
        ...(destChowk.trim() && { destinationChowk: destChowk.trim() })
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
        setLostForm({ 
          passengerName: user?.name || '', 
          passengerPhone: user?.phone || '', 
          itemDescription: '', 
          chowkLost: '', 
          travelDate: new Date().toISOString().split('T')[0] 
        });
      }, 1500);
    } catch (err) {
      alert('Failed to report lost item');
    }
  };

  const districtChowks = REGION_DATA[country]?.provinces[province]?.[district] || [];
  const popularChowks = REGION_DATA[country]?.popularChowks || [];
  const autocompleteList = [...new Set([...districtChowks, ...popularChowks])];

  // Only Owners or Admins have permission to add buses
  const canAddBus = user?.role === 'operator' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      
      {/* Search Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>📍 {province} ({district}) Commuter Route Planner</span>
            </h2>
            <p className="text-[11px] text-slate-500">Live Chowk-wise GPS, Regulated Fares & Direct Seat Reservation</p>
          </div>
          
          {/* ONLY SHOWN TO VERIFIED BUS OWNERS AND ADMINS */}
          {canAddBus && (
            <button
              onClick={() => setIsAddBusModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bus to Fleet</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Boarding Chowk / Stop</label>
            <input
              type="text"
              list="chowk-datalist"
              placeholder="e.g. Kalanki Chowk, Gongabu..."
              value={originChowk}
              onChange={(e) => setOriginChowk(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Dropping Chowk / Landmark</label>
            <input
              type="text"
              list="chowk-datalist"
              placeholder="e.g. Prithvi Chowk, Koteshwor..."
              value={destChowk}
              onChange={(e) => setDestChowk(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <datalist id="chowk-datalist">
            {autocompleteList.map(c => <option key={c} value={c} />)}
          </datalist>

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
                      return { label: '🔴 Full', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' };
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
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{bus.busName}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-semibold">{bus.busNumber}</p>
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

                    {/* Passenger Action Bar: Book Seat, Direct Call, Report Lost */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingBus(bus);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition shadow-xs"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Book Seat</span>
                        </button>

                        {driverPhone && (
                          <a
                            href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl flex items-center space-x-1"
                          >
                            <PhoneCall className="w-3 h-3 text-emerald-600" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLostBus(bus);
                          setLostModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Report Lost Item"
                      >
                        <PackageSearch className="w-4 h-4" />
                      </button>
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
            onBookSeat={(bus) => setBookingBus(bus)}
            country={country}
          />
        </div>
      </div>

      {/* Seat Booking Modal */}
      <SeatBookingModal
        isOpen={!!bookingBus}
        bus={bookingBus}
        onClose={() => setBookingBus(null)}
        onBookingSuccess={() => {
          fetchBuses();
        }}
      />

      {/* Add Bus Modal (Available only to Owners / Admins) */}
      {canAddBus && (
        <AddBusModal
          isOpen={isAddBusModalOpen}
          onClose={() => setIsAddBusModalOpen(false)}
          onBusAdded={(newBus) => {
            fetchBuses();
            setSelectedBus(newBus);
          }}
        />
      )}

      {/* Lost & Found Modal */}
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
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Report Lost Item on Bus</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {lostBus.busName} ({lostBus.busNumber}) • {lostBus.originChowk} ➔ {lostBus.destinationChowk}
            </p>

            {lostSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ticket registered. Driver & operator notified.</span>
              </div>
            ) : (
              <form onSubmit={handleLostSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Passenger Name</label>
                  <input
                    type="text"
                    required
                    value={lostForm.passengerName}
                    onChange={(e) => setLostForm({ ...lostForm, passengerName: e.target.value })}
                    placeholder="e.g. Ramesh Shrestha"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Your Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={lostForm.passengerPhone}
                    onChange={(e) => setLostForm({ ...lostForm, passengerPhone: e.target.value })}
                    placeholder="+977 9800000000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Chowk / Landmark Dropped</label>
                  <input
                    type="text"
                    required
                    value={lostForm.chowkLost}
                    onChange={(e) => setLostForm({ ...lostForm, chowkLost: e.target.value })}
                    placeholder="Near Kalanki Chowk or Mugling"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Item Description</label>
                  <textarea
                    rows={2}
                    required
                    value={lostForm.itemDescription}
                    onChange={(e) => setLostForm({ ...lostForm, itemDescription: e.target.value })}
                    placeholder="Blue backpack, citizenship certificate, wallet on seat..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl text-xs transition"
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
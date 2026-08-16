import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LiveMap from '../components/LiveMap';
import { useLanguage } from '../context/LanguageContext';
import { Bus, Route as RouteIcon, ShieldAlert, Radio, Search, Star, MessageSquare, CheckCircle2, ChevronRight, X, MapPin } from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Rating Modal State
  const [ratingModalBus, setRatingModalBus] = useState(null);
  const [driverRating, setDriverRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sosSent, setSosSent] = useState(false);

  const fetchFleetData = async () => {
    try {
      const [busesRes, routesRes] = await Promise.all([
        api.get('/buses'),
        api.get('/routes')
      ]);
      setBuses(busesRes.data.buses || []);
      setRoutes(routesRes.data.routes || []);
      if (routesRes.data.routes?.length > 0 && !selectedRoute) {
        setSelectedRoute(routesRes.data.routes[0]);
      }
    } catch (err) {
      console.error('Error loading transit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSOS = async () => {
    try {
      await api.post('/emergencies', {
        type: 'sos',
        description: 'Passenger emergency SOS triggered from live map',
        busId: selectedBus?._id || null,
        latitude: 16.2335,
        longitude: 80.5501
      });
      setSosSent(true);
      setTimeout(() => setSosSent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!ratingModalBus?.driverId?._id) return;
    try {
      await api.post('/auth/rate-driver', {
        driverId: ratingModalBus.driverId._id,
        rating: driverRating,
        comment: ratingComment
      });
      setRatingSuccess(true);
      setTimeout(() => {
        setRatingSuccess(false);
        setRatingModalBus(null);
        setRatingComment('');
      }, 1500);
      fetchFleetData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting rating.');
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (bus.busName && bus.busName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesOrigin = !originSearch || (bus.origin && bus.origin.toLowerCase().includes(originSearch.toLowerCase()));
    const matchesDest = !destinationSearch || (bus.destination && bus.destination.toLowerCase().includes(destinationSearch.toLowerCase()));
    const matchesRegion = selectedRegion === 'all' || bus.stateRegion === selectedRegion;
    return matchesSearch && matchesOrigin && matchesDest && matchesRegion;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">{t('totalFleet')}</span>
            <Bus className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{buses.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">{t('activeBuses')}</span>
            <Radio className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {buses.filter(b => b.status === 'active').length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">State / Region</span>
            <MapPin className="w-4 h-4 text-sky-600" />
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="mt-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs text-slate-900 dark:text-white"
          >
            <option value="all">{t('allRegions')}</option>
            <option value="Bagmati / Central">Bagmati / Central</option>
            <option value="Gandaki / West">Gandaki / West</option>
            <option value="Andhra / South">Andhra / South</option>
          </select>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Safety Alert</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <button
            onClick={handleTriggerSOS}
            className={`w-full text-xs font-medium py-1.5 rounded-lg transition ${
              sosSent ? 'bg-emerald-600 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {sosSent ? 'Dispatched' : t('sosAlert')}
          </button>
        </div>
      </div>

      {/* Origin & Destination Search Trip Planner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            📍 {t('origin')}
          </label>
          <input
            type="text"
            placeholder="e.g. Kathmandu, Central Station..."
            value={originSearch}
            onChange={(e) => setOriginSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            🎯 {t('destination')}
          </label>
          <input
            type="text"
            placeholder="e.g. University Campus, Pokhara..."
            value={destinationSearch}
            onChange={(e) => setDestinationSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Main Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Bus Radar Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-[540px] shadow-xs">
          <div className="space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">{t('fleet')}</h2>
              <span className="text-xs text-slate-500">{filteredBuses.length} buses</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchBus')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredBuses.map((bus) => {
              const isSelected = selectedBus?._id === bus._id;
              const activeDriver = bus.isDriverAbsent ? bus.substituteDriverId : bus.driverId;

              return (
                <div
                  key={bus._id}
                  onClick={() => setSelectedBus(bus)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col space-y-2 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-lg">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{bus.busNumber}</p>
                        <p className="text-[10px] text-slate-400">{bus.busName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {bus.capacity} {t('seats')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
                    <span>{bus.origin} ➔ {bus.destination}</span>
                    {activeDriver && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatingModalBus(bus);
                        }}
                        className="text-amber-500 hover:underline flex items-center space-x-1"
                      >
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{activeDriver.averageRating || '5.0'}</span>
                      </button>
                    )}
                  </div>

                  {bus.isDriverAbsent && (
                    <div className="text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 p-1.5 rounded-lg">
                      ⚠️ {t('driverAbsent')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Map Canvas */}
        <div className="lg:col-span-2">
          <LiveMap
            buses={buses}
            selectedBus={selectedBus}
            onSelectBus={setSelectedBus}
            activeRoute={selectedRoute}
          />
        </div>
      </div>

      {/* Driver Rating Modal */}
      {ratingModalBus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative">
            <button
              onClick={() => setRatingModalBus(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">{t('rateDriver')}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Driver: {ratingModalBus.isDriverAbsent ? ratingModalBus.substituteDriverId?.name : ratingModalBus.driverId?.name}
            </p>

            {ratingSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you for your rating!</span>
              </div>
            ) : (
              <form onSubmit={handleRateSubmit} className="space-y-4">
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDriverRating(star)}
                      className="p-1"
                    >
                      <Star className={`w-7 h-7 ${star <= driverRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Comments (Optional)</label>
                  <textarea
                    rows={3}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Safe driving, clean bus, punctual..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl text-xs transition"
                >
                  {t('submitRating')}
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
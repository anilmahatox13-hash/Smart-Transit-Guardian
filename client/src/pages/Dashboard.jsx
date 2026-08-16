import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LiveMap from '../components/LiveMap';
import { Bus, Route as RouteIcon, ShieldAlert, Radio, Search, CheckCircle2, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

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
    setSosLoading(true);
    try {
      await api.post('/emergencies', {
        type: 'sos',
        description: 'Passenger emergency SOS triggered from dashboard',
        busId: selectedBus?._id || null,
        latitude: 16.2335,
        longitude: 80.5501
      });
      setSosSent(true);
      setTimeout(() => setSosSent(false), 4000);
    } catch (err) {
      console.error('Failed to send SOS:', err);
    } finally {
      setSosLoading(false);
    }
  };

  const filteredBuses = buses.filter(bus => 
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Fleet</span>
            <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{buses.length}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Vehicles Registered</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Active Routes</span>
            <RouteIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{routes.length}</p>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Scheduled Corridors</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Buses En Route</span>
            <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {buses.filter(b => b.status === 'active').length}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Live GPS Stream</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Emergency Response</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <button
            onClick={handleTriggerSOS}
            disabled={sosLoading || sosSent}
            className={`w-full text-xs font-medium py-1.5 px-2 rounded-lg transition flex items-center justify-center space-x-1 ${
              sosSent
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {sosSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dispatched</span>
              </>
            ) : sosLoading ? (
              <span>Sending...</span>
            ) : (
              <span>Trigger SOS Alert</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col h-[520px] shadow-xs">
          
          <div className="space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">Active Vehicles</h2>
              <span className="text-xs text-slate-500">{filteredBuses.length} total</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search bus number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Route Filter Dropdown */}
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Filter by Route</label>
              <select
                value={selectedRoute?._id || ''}
                onChange={(e) => {
                  const r = routes.find(item => item._id === e.target.value);
                  setSelectedRoute(r);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {routes.map(route => (
                  <option key={route._id} value={route._id}>
                    {route.name} ({route.startPoint} ➔ {route.endPoint})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading vehicles...
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No buses found.
              </div>
            ) : (
              filteredBuses.map((bus) => {
                const isSelected = selectedBus?._id === bus._id;
                return (
                  <div
                    key={bus._id}
                    onClick={() => setSelectedBus(bus)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-md ${
                        bus.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white">{bus.busNumber}</p>
                          <span className="text-[10px] capitalize text-slate-500 dark:text-slate-400">
                            {bus.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{bus.registrationNumber}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-1 text-slate-400">
                      <span className="text-[11px]">{bus.capacity} seats</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })
            )}
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

    </div>
  );
};

export default Dashboard;
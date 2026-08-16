import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LiveMap from '../components/LiveMap';
import { Bus, Route as RouteIcon, ShieldAlert, Radio, Clock, MapPin, Search, CheckCircle2, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Fetch initial fleet and route data
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
    // Live Telemetry Polling (every 6 seconds)
    const interval = setInterval(fetchFleetData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSOS = async () => {
    setSosLoading(true);
    try {
      await api.post('/emergencies', {
        type: 'sos',
        description: 'Passenger emergency SOS trigger from live web app',
        busId: selectedBus?._id || null,
        latitude: 16.2335,
        longitude: 80.5501
      });
      setSosSent(true);
      setTimeout(() => setSosSent(false), 5000);
    } catch (err) {
      console.error('Failed to dispatch SOS alert:', err);
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
      
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Fleet</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{buses.length}</p>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Telematics Active
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Routes</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <RouteIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{routes.length}</p>
          <span className="text-[11px] text-sky-400 font-medium mt-1 block">Campus & Metro</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Buses En Route</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {buses.filter(b => b.status === 'active').length}
          </p>
          <span className="text-[11px] text-teal-400 font-medium mt-1 block">Real-time GPS</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Safety SOS</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={handleTriggerSOS}
            disabled={sosLoading || sosSent}
            className={`mt-2 w-full text-xs font-semibold py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow ${
              sosSent
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
            }`}
          >
            {sosSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched!
              </>
            ) : sosLoading ? (
              'Transmitting...'
            ) : (
              '1-Click SOS Dispatch'
            )}
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Dashboard: Map + Fleet Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Pane: Route Filter & Bus List */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl flex flex-col h-[520px]">
          
          {/* Header & Search */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Fleet Radar</h3>
              <span className="text-[11px] font-mono text-slate-400">{filteredBuses.length} tracked</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search bus number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Route Selector Dropdown */}
            <div>
              <label className="text-[11px] text-slate-400 font-medium mb-1 block">Active Route Filter</label>
              <select
                value={selectedRoute?._id || ''}
                onChange={(e) => {
                  const r = routes.find(item => item._id === e.target.value);
                  setSelectedRoute(r);
                }}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {routes.map(route => (
                  <option key={route._id} value={route._id}>
                    {route.name} ({route.startPoint} ➔ {route.endPoint})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrollable Bus Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Scanning telemetry streams...
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No active buses found.
              </div>
            ) : (
              filteredBuses.map((bus) => {
                const isSelected = selectedBus?._id === bus._id;
                return (
                  <div
                    key={bus._id}
                    onClick={() => setSelectedBus(bus)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${
                        bus.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-white">{bus.busNumber}</p>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                            bus.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {bus.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{bus.registrationNumber}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-200">
                        {bus.capacity} seats
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 justify-end">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Interactive Live Leaflet Map */}
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
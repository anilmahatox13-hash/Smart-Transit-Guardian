import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import LiveMap from '../components/LiveMap';
import SeatBookingModal from '../components/SeatBookingModal';
import { useRegion } from '../context/RegionContext';
import { 
  Search, 
  MapPin, 
  Bus as BusIcon, 
  Gauge, 
  Radio, 
  ArrowRight, 
  ArrowLeftRight,
  Filter, 
  RotateCcw, 
  Navigation, 
  Phone, 
  Info, 
  X, 
  SortAsc,
  ExternalLink
} from 'lucide-react';

const Home = () => {
  const { currency } = useRegion();
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  
  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedBusType, setSelectedBusType] = useState('all');
  const [sortBy, setSortBy] = useState('name_az');
  const [activeQuery, setActiveQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingBus, setBookingBus] = useState(null);
  const [detailModalBus, setDetailModalBus] = useState(null);

  const fetchBuses = async () => {
    try {
      const res = await api.get('/buses?verificationStatus=all');
      const busList = res.data.buses || [];
      setBuses(busList);
      if (busList.length > 0 && !selectedBus) {
        setSelectedBus(busList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();

    socket.on('bus_location_update', (telemetry) => {
      setBuses((prev) =>
        prev.map((b) => {
          if (b._id === telemetry.busId) {
            const updated = {
              ...b,
              currentLocation: telemetry.currentLocation,
              currentSpeed: telemetry.currentSpeed,
              currentChowkIndex: telemetry.currentChowkIndex,
              isLive: telemetry.isLive
            };
            if (selectedBus?._id === telemetry.busId) setSelectedBus(updated);
            return updated;
          }
          return b;
        })
      );
    });

    socket.on('new_bus_registered', (newBus) => {
      setBuses((prev) => [newBus, ...prev.filter((b) => b._id !== newBus._id)]);
    });

    return () => {
      socket.off('bus_location_update');
      socket.off('new_bus_registered');
    };
  }, [selectedBus]);

  // Extract unique origins and destinations (sorted A-Z)
  const availableOrigins = useMemo(() => {
    const set = new Set();
    buses.forEach(b => {
      if (b.originDistrict) set.add(b.originDistrict.trim());
      if (b.originChowk) set.add(b.originChowk.trim());
      if (b.origin) set.add(b.origin.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [buses]);

  const availableDestinations = useMemo(() => {
    const set = new Set();
    buses.forEach(b => {
      if (b.destDistrict) set.add(b.destDistrict.trim());
      if (b.destinationChowk) set.add(b.destinationChowk.trim());
      if (b.destination) set.add(b.destination.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [buses]);

  const availableBusTypes = useMemo(() => {
    const set = new Set();
    buses.forEach(b => {
      if (b.busType) set.add(b.busType.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [buses]);

  const handleSwapPlaces = () => {
    const temp = selectedOrigin;
    setSelectedOrigin(selectedDestination);
    setSelectedDestination(temp);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setActiveQuery('');
    setSelectedOrigin('');
    setSelectedDestination('');
    setSelectedBusType('all');
    setSortBy('name_az');
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveQuery(searchInput.trim());
  };

  // Helper to generate Google Maps direct link with real GPS coordinates
  const getGoogleMapsUrl = (bus) => {
    const coords = bus?.currentLocation?.coordinates || bus?.lastLocation?.coordinates || [85.3240, 27.7172];
    const lng = coords[0];
    const lat = coords[1];
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  // Filter and Sort Buses
  const filteredAndSortedBuses = useMemo(() => {
    const q = (activeQuery || searchInput).toLowerCase().trim();

    let result = buses.filter((bus) => {
      const matchesSearch = !q ||
        bus.busName?.toLowerCase().includes(q) ||
        bus.busNumber?.toLowerCase().includes(q) ||
        bus.originDistrict?.toLowerCase().includes(q) ||
        bus.destDistrict?.toLowerCase().includes(q) ||
        bus.originChowk?.toLowerCase().includes(q) ||
        bus.destinationChowk?.toLowerCase().includes(q) ||
        bus.routeChowks?.some(c => c.name?.toLowerCase().includes(q));

      const matchesOrigin = !selectedOrigin ||
        bus.originDistrict?.toLowerCase() === selectedOrigin.toLowerCase() ||
        bus.originChowk?.toLowerCase() === selectedOrigin.toLowerCase() ||
        bus.origin?.toLowerCase().includes(selectedOrigin.toLowerCase()) ||
        bus.routeChowks?.some(c => c.name?.toLowerCase() === selectedOrigin.toLowerCase());

      const matchesDestination = !selectedDestination ||
        bus.destDistrict?.toLowerCase() === selectedDestination.toLowerCase() ||
        bus.destinationChowk?.toLowerCase() === selectedDestination.toLowerCase() ||
        bus.destination?.toLowerCase().includes(selectedDestination.toLowerCase()) ||
        bus.routeChowks?.some(c => c.name?.toLowerCase() === selectedDestination.toLowerCase());

      const matchesType = selectedBusType === 'all' || bus.busType === selectedBusType;

      return matchesSearch && matchesOrigin && matchesDestination && matchesType;
    });

    result.sort((a, b) => {
      if (sortBy === 'name_az') return (a.busName || '').localeCompare(b.busName || '');
      if (sortBy === 'fare_asc') return (a.baseFare || a.fare || 0) - (b.baseFare || b.fare || 0);
      if (sortBy === 'fare_desc') return (b.baseFare || b.fare || 0) - (a.baseFare || a.fare || 0);
      return 0;
    });

    return result;
  }, [buses, activeQuery, searchInput, selectedOrigin, selectedDestination, selectedBusType, sortBy]);

  // Selects bus and scrolls smoothly down to the live map
  const handleTrackOnMap = (bus) => {
    setSelectedBus(bus);
    const mapElement = document.getElementById('live-map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (bus) => {
    setBookingBus(bus);
    setBookingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. TOP SEARCH & FILTER MATRIX */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Real-Time Highway Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Find & Track Available Buses</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Browse all operating buses, open coordinates in Google Maps, or track real-time telemetry below.
          </p>
        </div>

        {/* Search Matrix Form */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            
            {/* Origin Dropdown (A-Z) */}
            <div className="sm:col-span-3">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                From (Origin)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-400 pointer-events-none" />
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">All Origins (A ➔ Z)</option>
                  {availableOrigins.map((origin) => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center pb-0.5">
              <button
                type="button"
                onClick={handleSwapPlaces}
                title="Swap Origin and Destination"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Dropdown (A-Z) */}
            <div className="sm:col-span-3">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                To (Destination)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-sky-400 pointer-events-none" />
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">All Destinations (A ➔ Z)</option>
                  {availableDestinations.map((dest) => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct Keyword Search Input */}
            <div className="sm:col-span-3">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Bus Name / Plate / Chowk
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Sajha, Pokhara, BA-01..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Buses</span>
              </button>
            </div>

          </div>

          {/* Filter Pills & Sorting */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setSelectedBusType('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedBusType === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Buses
              </button>
              {availableBusTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedBusType(type)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedBusType === type ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
                <SortAsc className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer"
                >
                  <option value="name_az">Bus Name (A ➔ Z)</option>
                  <option value="fare_asc">Fare: Low to High</option>
                  <option value="fare_desc">Fare: High to Low</option>
                </select>
              </div>

              {(searchInput || activeQuery || selectedOrigin || selectedDestination || selectedBusType !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition flex items-center space-x-1 text-xs cursor-pointer hover:bg-rose-500/30"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 2. AVAILABLE BUSES LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="font-black text-lg text-slate-900 dark:text-white">
              Available Fleet Buses ({filteredAndSortedBuses.length})
            </h2>
            <p className="text-xs text-slate-500">Track on map, open in Google Maps, or book seats directly</p>
          </div>
        </div>

        {filteredAndSortedBuses.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <BusIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">No buses found matching your search</h4>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-emerald-600 font-bold underline cursor-pointer"
            >
              Clear filters and show all operating buses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedBuses.map((bus) => {
              const isSelected = selectedBus?._id === bus._id;
              const fare = bus.baseFare || bus.fare || 500;
              const gmapsUrl = getGoogleMapsUrl(bus);

              return (
                <div
                  key={bus._id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs transition flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{bus.busName}</h4>
                        <span className="font-mono text-xs text-slate-400">{bus.busNumber}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        {bus.busType || 'Express'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300 my-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Route:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {bus.originDistrict || bus.origin} ➔ {bus.destDistrict || bus.destination}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Boarding Point:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {bus.originChowk || bus.origin}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Live GPS Speed:</span>
                        <span className="font-mono font-bold text-sky-600">{bus.currentSpeed || 45} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Matrix */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTrackOnMap(bus)}
                        className="flex-1 px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Track Live</span>
                      </button>

                      {/* Google Maps Direct Redirection Link */}
                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                        title="Open Live Location in Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>GMap</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setDetailModalBus(bus)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                        title="View Full Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBooking(bus)}
                      className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <span>Book Seat ({currency} {fare})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. LIVE SATELLITE TRANSIT MAP (POSITIONED BELOW BUSES) */}
      <div id="live-map-section" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-emerald-600" />
            <h2 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider">
              Live Satellite Transit Map
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing <b>{filteredAndSortedBuses.length}</b> buses on live radar
          </span>
        </div>

        <LiveMap
          buses={filteredAndSortedBuses}
          selectedBus={selectedBus}
          onSelectBus={handleTrackOnMap}
          onBookSeat={handleOpenBooking}
        />
      </div>

      {/* Full Bus Details Modal */}
      {detailModalBus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setDetailModalBus(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <BusIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{detailModalBus.busName}</h3>
                <span className="font-mono text-xs text-slate-400 font-semibold">{detailModalBus.busNumber}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Route Corridor:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {detailModalBus.originDistrict || detailModalBus.origin} ➔ {detailModalBus.destDistrict || detailModalBus.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Boarding Point:</span>
                <span className="font-medium text-emerald-600">{detailModalBus.originChowk || detailModalBus.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-medium text-sky-600">{detailModalBus.destinationChowk || detailModalBus.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacity & Class:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalBus.capacity} Seats • {detailModalBus.busType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver Contact:</span>
                <a href={`tel:${detailModalBus.contactPhone}`} className="font-bold text-emerald-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{detailModalBus.contactPhone || 'Available'}</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={getGoogleMapsUrl(detailModalBus)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setDetailModalBus(null);
                  handleTrackOnMap(detailModalBus);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Track on Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDetailModalBus(null);
                  handleOpenBooking(detailModalBus);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Book Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Booking Modal */}
      {bookingBus && (
        <SeatBookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingBus(null);
          }}
          bus={bookingBus}
        />
      )}
    </div>
  );
};

export default Home;
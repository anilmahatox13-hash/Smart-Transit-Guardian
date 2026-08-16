import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Bus, 
  MapPin, 
  Gauge, 
  Compass, 
  Layers, 
  LocateFixed, 
  Maximize2, 
  Sparkles,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

// Controller to smoothly animate pan & zoom transitions
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, {
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
};

// Create High-End Rotatable SVG Bus Marker
const createBusIcon = (bus, isSelected) => {
  const status = bus.status || 'idle';
  const heading = bus.heading || 0;
  const isEnRoute = status === 'active';
  
  const primaryColor = isEnRoute ? '#10b981' : status === 'maintenance' ? '#f43f5e' : '#f59e0b';
  const glow = isSelected 
    ? '0 0 22px rgba(16, 185, 129, 0.9)' 
    : '0 8px 16px rgba(0, 0, 0, 0.6)';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        ${isEnRoute ? `
          <div class="bus-radar-ring" style="background-color: ${primaryColor};"></div>
          <div class="bus-radar-ring-delayed" style="background-color: ${primaryColor};"></div>
        ` : ''}
        
        <div style="
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
          border: 2px solid ${primaryColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${primaryColor};
          box-shadow: ${glow};
          z-index: 10;
          position: relative;
        ">
          <!-- Bus Vehicle SVG Icon -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path>
            <path d="M15 6v6"></path>
            <path d="M2 12h19.6"></path>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-2.8-1.5-4-3-4H4c-1.5 0-3 1.2-3 4 0 .4.1.8.2 1.2l.8 2.8h3"></path>
            <circle cx="7" cy="18" r="2"></circle>
            <circle cx="17" cy="18" r="2"></circle>
          </svg>

          <!-- Heading Orientation Pointer -->
          <div style="
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translateX(-50%) rotate(${heading}deg);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 7px solid ${primaryColor};
          "></div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24]
  });
};

// Sequenced Route Stop Node
const createStopIcon = (stop, index) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        background: #0f172a;
        border: 2px solid #38bdf8;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #38bdf8;
        font-size: 10px;
        font-weight: 700;
        font-family: monospace;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const LiveMap = ({ buses = [], selectedBus, onSelectBus, activeRoute }) => {
  const defaultCenter = [16.2335, 80.5501]; // Guntur / Andhra Campus Hub
  const [mapLayer, setMapLayer] = useState('dark'); // 'dark' | 'satellite' | 'streets'
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(14);

  // Basemap Tile Providers
  const tileProviders = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics'
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }
  };

  useEffect(() => {
    if (selectedBus?.lastLocation?.coordinates) {
      setMapCenter([selectedBus.lastLocation.coordinates[1], selectedBus.lastLocation.coordinates[0]]);
      setMapZoom(15);
    }
  }, [selectedBus]);

  const handleRecenter = () => {
    setMapCenter(defaultCenter);
    setMapZoom(14);
    if (onSelectBus) onSelectBus(null);
  };

  // Route Track Coordinates
  const routePolyline = activeRoute?.stops?.map(stop => [
    stop.location.coordinates[1],
    stop.location.coordinates[0]
  ]) || [];

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950">
      
      {/* Interactive Map Canvas */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        zoomControl={true}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Dynamic Basemap Tiles */}
        <TileLayer
          url={tileProviders[mapLayer].url}
          attribution={tileProviders[mapLayer].attribution}
          maxZoom={19}
        />

        {/* Primary Route Polyline (Glow + Solid Track) */}
        {routePolyline.length > 1 && (
          <>
            {/* Outer Glow Line */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#10b981',
                weight: 8,
                opacity: 0.25,
                lineCap: 'round'
              }}
            />
            {/* Inner Dashed Line */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#34d399',
                weight: 3.5,
                opacity: 0.95,
                dashArray: '6, 8',
                lineCap: 'round'
              }}
            />
          </>
        )}

        {/* Sequenced Route Stops */}
        {activeRoute?.stops?.map((stop, index) => (
          <Marker
            key={stop._id || index}
            position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
            icon={createStopIcon(stop, index)}
          >
            <Popup>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl min-w-[180px]">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-white">{stop.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Transit Stop #{index + 1}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Bus:</span>
                    <span className="text-emerald-400 font-mono font-semibold">~4 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Crowd Level:</span>
                    <span className="text-amber-400 font-medium">Moderate</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Active Buses */}
        {buses.map((bus) => {
          if (!bus.lastLocation?.coordinates) return null;
          const [lng, lat] = bus.lastLocation.coordinates;
          const isSelected = selectedBus?._id === bus._id;

          return (
            <Marker
              key={bus._id}
              position={[lat, lng]}
              icon={createBusIcon(bus, isSelected)}
              eventHandlers={{
                click: () => onSelectBus && onSelectBus(bus)
              }}
            >
              <Popup>
                <div className="p-3 bg-slate-950 text-slate-100 rounded-2xl min-w-[220px] space-y-3">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-base text-white tracking-tight">{bus.busNumber}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{bus.registrationNumber}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                      bus.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {bus.status}
                    </span>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">GPS Speed</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">42 km/h</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Occupancy</span>
                      <span className="text-sm font-bold font-mono text-sky-400">28 / {bus.capacity}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver:</span>
                      <span className="font-medium text-slate-200">{bus.driverId?.name || 'Assigned Driver'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Route:</span>
                      <span className="text-emerald-400 font-medium">{bus.routeId?.name || 'Express Line'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectBus && onSelectBus(bus)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold py-2 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Track Telemetry Live</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Top-Right Floating Controls Hub */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2 pointer-events-auto">
        
        {/* Layer Switcher Pill */}
        <div className="bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/80 shadow-2xl flex items-center gap-1">
          <button
            onClick={() => setMapLayer('dark')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
              mapLayer === 'dark'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Vector
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
              mapLayer === 'satellite'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapLayer('streets')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
              mapLayer === 'streets'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Street
          </button>
        </div>

        {/* Recenter Fleet Map Button */}
        <button
          onClick={handleRecenter}
          className="self-end bg-slate-900/90 hover:bg-slate-800 backdrop-blur-xl p-2.5 rounded-2xl border border-slate-800 text-slate-300 hover:text-emerald-400 shadow-2xl transition-all duration-150 flex items-center gap-1.5 text-xs font-semibold"
          title="Reset Map View"
        >
          <LocateFixed className="w-4 h-4 text-emerald-400" />
          <span>Recenter Fleet</span>
        </button>
      </div>

      {/* Bottom-Left Live HUD Card */}
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-2xl border border-slate-800/80 shadow-2xl text-xs flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase">GPS Telematics</p>
            <p className="font-bold text-white text-xs">RTK Ingestion Live</p>
          </div>
        </div>
        <div className="h-6 w-[1px] bg-slate-800"></div>
        <div>
          <p className="text-[10px] text-slate-400 font-mono uppercase">Active Buses</p>
          <p className="font-bold text-emerald-400 font-mono text-xs">{buses.filter(b => b.status === 'active').length} on track</p>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
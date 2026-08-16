import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, MapPin, Users, Activity } from 'lucide-react';

// Dynamic Map Recenter Component
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// Custom SVG Bus Icon Creator (No broken image URLs)
const createBusIcon = (status, isSelected) => {
  const color = status === 'active' ? '#10b981' : status === 'maintenance' ? '#ef4444' : '#f59e0b';
  const glow = isSelected ? '0 0 16px rgba(16, 185, 129, 0.8)' : '0 4px 10px rgba(0,0,0,0.5)';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <div class="pulse-ring" style="background-color: ${color};"></div>
        <div style="
          width: 32px;
          height: 32px;
          background: #0f172a;
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          box-shadow: ${glow};
          z-index: 2;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path>
            <path d="M15 6v6"></path>
            <path d="M2 12h19.6"></path>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-2.8-1.5-4-3-4H4c-1.5 0-3 1.2-3 4 0 .4.1.8.2 1.2l.8 2.8h3"></path>
            <circle cx="7" cy="18" r="2"></circle>
            <circle cx="17" cy="18" r="2"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

// Route Stop Dot Icon
const createStopIcon = (name) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background: #38bdf8;
        border: 2px solid #0f172a;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const LiveMap = ({ buses = [], selectedBus, onSelectBus, activeRoute }) => {
  const defaultCenter = [16.2335, 80.5501]; // Guntur / Campus Transit Coordinates
  const currentCenter = selectedBus?.lastLocation?.coordinates
    ? [selectedBus.lastLocation.coordinates[1], selectedBus.lastLocation.coordinates[0]]
    : defaultCenter;

  // Extract Route Coordinates for Polyline
  const routePolyline = activeRoute?.stops?.map(stop => [
    stop.location.coordinates[1],
    stop.location.coordinates[0]
  ]) || [];

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={currentCenter} zoom={selectedBus ? 15 : 14} />

        {/* High Performance OpenStreetMap Dark Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline Track */}
        {routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#10b981',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8',
              lineCap: 'round'
            }}
          />
        )}

        {/* Route Stops Markers */}
        {activeRoute?.stops?.map((stop, index) => (
          <Marker
            key={stop._id || index}
            position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
            icon={createStopIcon(stop.name)}
          >
            <Popup>
              <div className="p-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{stop.name}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 font-mono">
                  Stop #{stop.order} • Transit Hub
                </p>
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
              icon={createBusIcon(bus.status, isSelected)}
              eventHandlers={{
                click: () => onSelectBus && onSelectBus(bus)
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                    <span className="font-bold text-emerald-400 text-sm">{bus.busNumber}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {bus.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Plate:</span>
                      <span className="font-mono text-slate-200">{bus.registrationNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Capacity:</span>
                      <span className="font-semibold text-slate-200">{bus.capacity} seats</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Route:</span>
                      <span className="text-emerald-400">{bus.routeId?.name || 'Assigned Express'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectBus && onSelectBus(bus)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1.5 rounded-lg font-medium transition shadow"
                  >
                    Track This Bus
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Telemetry Legend Card */}
      <div className="absolute top-4 right-4 z-[500] bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs shadow-xl space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-800 pb-1">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Telemetry</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-slate-300">En Route ({buses.filter(b => b.status === 'active').length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">Idle / Standby ({buses.filter(b => b.status === 'idle').length})</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
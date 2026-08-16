import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import { Bus, MapPin, Navigation } from 'lucide-react';

// Solves Leaflet container 0x0 size and black screen glitches
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Smoothly flies to selected vehicle
const MapCenterController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, { duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
};

// Clean Professional SVG Bus Icon
const createBusIcon = (status, isSelected) => {
  const isEnRoute = status === 'active';
  const bgColor = isEnRoute ? '#059669' : '#d97706';

  return L.divIcon({
    className: 'vehicle-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${bgColor};
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path>
          <path d="M15 6v6"></path>
          <path d="M2 12h19.6"></path>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-2.8-1.5-4-3-4H4c-1.5 0-3 1.2-3 4 0 .4.1.8.2 1.2l.8 2.8h3"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <circle cx="17" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Stop Pin
const createStopIcon = (index) => {
  return L.divIcon({
    className: 'stop-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #0284c7;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        font-family: sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const LiveMap = ({ buses = [], selectedBus, onSelectBus, activeRoute }) => {
  const { theme } = useTheme();
  const defaultCenter = [16.2335, 80.5501]; // Guntur / Campus Transit Center

  const currentCenter = selectedBus?.lastLocation?.coordinates
    ? [selectedBus.lastLocation.coordinates[1], selectedBus.lastLocation.coordinates[0]]
    : defaultCenter;

  const routePolyline = activeRoute?.stops?.map(stop => [
    stop.location.coordinates[1],
    stop.location.coordinates[0]
  ]) || [];

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapResizer />
        <MapCenterController center={currentCenter} zoom={selectedBus ? 15 : 14} />

        {/* Reliable Standard Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Route Track Line */}
        {routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#059669',
              weight: 4,
              opacity: 0.8
            }}
          />
        )}

        {/* Route Stops */}
        {activeRoute?.stops?.map((stop, index) => (
          <Marker
            key={stop._id || index}
            position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
            icon={createStopIcon(index)}
          >
            <Popup>
              <div className="p-2 text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">{stop.name}</p>
                <p className="text-slate-500 dark:text-slate-400">Stop #{index + 1}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Buses */}
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
                <div className="p-3 text-xs space-y-2 min-w-[180px]">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">{bus.busNumber}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {bus.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Registration:</span>
                      <span className="font-mono font-medium">{bus.registrationNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span>{bus.capacity} seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {bus.routeId?.name || 'Assigned Route'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectBus && onSelectBus(bus)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 rounded font-medium transition mt-1"
                  >
                    Select Vehicle
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Status Pill */}
      <div className="absolute top-3 right-3 z-[500] bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm text-xs flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {buses.filter(b => b.status === 'active').length} Buses Active
        </span>
      </div>
    </div>
  );
};

export default LiveMap;
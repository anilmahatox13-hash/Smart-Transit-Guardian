import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PhoneCall, Share2, Star, Navigation, MapPin } from 'lucide-react';

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const MapCenterController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

const createBusIcon = (bus, isSelected) => {
  const isEnRoute = bus.status === 'active';
  const color = isEnRoute ? '#059669' : '#d97706';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${color};
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: ${isSelected ? '0 0 16px rgba(5, 150, 105, 0.9)' : '0 4px 8px rgba(0,0,0,0.3)'};
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
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

const createChowkIcon = (index) => {
  return L.divIcon({
    className: 'chowk-marker',
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: #0284c7;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(2, 132, 199, 0.8);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const LiveMap = ({ buses = [], selectedBus, onSelectBus, country = 'Nepal' }) => {
  const defaultCenter = country === 'India' ? [28.6139, 77.2090] : [27.7172, 85.3240];

  const currentCenter = selectedBus?.lastLocation?.coordinates
    ? [selectedBus.lastLocation.coordinates[1], selectedBus.lastLocation.coordinates[0]]
    : (buses.length > 0 && buses[0].lastLocation?.coordinates
        ? [buses[0].lastLocation.coordinates[1], buses[0].lastLocation.coordinates[0]]
        : defaultCenter);

  const routePolyline = selectedBus?.routeChowks?.map(c => [c.coordinates[1], c.coordinates[0]]) || [];

  const handleShareWhatsApp = (bus) => {
    const [lng, lat] = bus.lastLocation.coordinates;
    const text = encodeURIComponent(`🚍 Live Bus Tracking: I am tracking Bus ${bus.busNumber} (${bus.originChowk} ➔ ${bus.destinationChowk}). Live Map: https://maps.google.com/?q=${lat},${lng}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
      <MapContainer
        center={defaultCenter}
        zoom={country === 'India' ? 6 : 8}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapResizer />
        <MapCenterController center={currentCenter} zoom={selectedBus ? 13 : (country === 'India' ? 6 : 8)} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Route Polyline Track */}
        {routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: '#059669', weight: 4, opacity: 0.85, dashArray: '6, 8' }}
          />
        )}

        {/* Selected Bus Intermediate Chowks */}
        {selectedBus?.routeChowks?.map((chowk, idx) => (
          <Marker
            key={chowk._id || idx}
            position={[chowk.coordinates[1], chowk.coordinates[0]]}
            icon={createChowkIcon(idx)}
          >
            <Popup>
              <div className="p-2 text-xs">
                <p className="font-bold text-slate-900">{chowk.name}</p>
                <p className="text-slate-500">Stop #{chowk.sequence} • ~{chowk.estimatedMinutesFromStart} mins from origin</p>
                <p className="text-emerald-600 font-semibold mt-0.5">Fare: {selectedBus.country === 'Nepal' ? 'NPR' : 'INR'} {chowk.fareFromStart}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Buses */}
        {buses.map((bus) => {
          if (!bus.lastLocation?.coordinates) return null;
          const [lng, lat] = bus.lastLocation.coordinates;
          const isSelected = selectedBus?._id === bus._id;
          const activeDriver = bus.isDriverAbsent ? bus.substituteDriverId : bus.driverId;
          const driverPhone = activeDriver?.phone || bus.contactPhone;

          return (
            <Marker
              key={bus._id}
              position={[lat, lng]}
              icon={createBusIcon(bus, isSelected)}
              eventHandlers={{ click: () => onSelectBus && onSelectBus(bus) }}
            >
              <Popup>
                <div className="p-3 text-xs space-y-2 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{bus.busNumber}</h4>
                      <p className="text-[10px] text-slate-400">{bus.busName}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold uppercase">
                      {bus.status}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-emerald-600">
                    {bus.originChowk} ➔ {bus.destinationChowk}
                  </p>

                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span className="font-semibold text-emerald-600">{bus.lastLocation.speed || 40} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Driver:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{activeDriver?.name || 'Assigned Driver'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {driverPhone && (
                      <a
                        href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleShareWhatsApp(bus)}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
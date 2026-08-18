import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Bus as BusIcon, 
  Maximize2, 
  Minimize2, 
  Gauge, 
  MapPin, 
  Phone, 
  Radio, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

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

const MapViewController = ({ targetCoords, zoomLevel }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords && targetCoords[0] && targetCoords[1]) {
      map.flyTo(targetCoords, zoomLevel || 13, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [targetCoords, zoomLevel, map]);
  return null;
};

const MAP_LAYERS = {
  google_streets: {
    name: 'Google Streets',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  google_hybrid: {
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Satellite Imagery'
  },
  osm_transit: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

const createBusPin = (bus, isSelected) => {
  const speed = bus.currentSpeed || 0;
  const shortName = bus.busName ? bus.busName.split(' ')[0] : 'Bus';

  return L.divIcon({
    className: 'google-bus-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          position: absolute;
          top: 2px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: ${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(14, 165, 233, 0.35)'};
          animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          pointer-events: none;
        "></div>

        <div style="
          position: relative;
          background: ${isSelected ? '#059669' : '#0284c7'};
          color: #ffffff;
          padding: 8px;
          border-radius: 9999px;
          border: 2.5px solid #ffffff;
          box-shadow: 0 6px 16px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(${isSelected ? 1.2 : 1});
          transition: transform 0.2s ease;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.4-1-1-1H3c-.6 0-1 .4-1 1 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
            <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          </svg>
        </div>

        <div style="
          margin-top: 4px;
          background: #0f172a;
          color: #f8fafc;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 9999px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        ">
          <span style="color: #34d399;">●</span>
          <span>${shortName}</span>
          <span style="background: rgba(255,255,255,0.15); padding: 1px 4px; border-radius: 4px; font-family: monospace;">${speed} km/h</span>
        </div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [84, 56],
    iconAnchor: [42, 24]
  });
};

const createChowkPin = (chowk, sequence, isPassed) => {
  return L.divIcon({
    className: 'chowk-marker',
    html: `
      <div style="
        background: ${isPassed ? '#94a3b8' : '#ffffff'};
        color: ${isPassed ? '#ffffff' : '#0f172a'};
        border: 2px solid ${isPassed ? '#64748b' : '#10b981'};
        font-weight: 800;
        font-size: 10px;
        font-family: monospace;
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">
        ${sequence}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const LiveMap = ({ buses = [], selectedBus, onSelectBus, onBookSeat }) => {
  const [activeLayer, setActiveLayer] = useState('google_streets');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const defaultCenter = [27.7172, 85.3240];

  const targetMapCenter = useMemo(() => {
    if (selectedBus?.currentLocation?.coordinates && selectedBus.currentLocation.coordinates.length === 2) {
      const [lng, lat] = selectedBus.currentLocation.coordinates;
      return [lat, lng];
    }
    if (buses.length > 0 && buses[0].currentLocation?.coordinates && buses[0].currentLocation.coordinates.length === 2) {
      const [lng, lat] = buses[0].currentLocation.coordinates;
      return [lat, lng];
    }
    return defaultCenter;
  }, [selectedBus, buses]);

  const corridorPolyline = useMemo(() => {
    if (!selectedBus?.routeChowks || selectedBus.routeChowks.length === 0) return [];
    return selectedBus.routeChowks
      .filter(c => c.coordinates && c.coordinates.length === 2)
      .map(c => [c.coordinates[1], c.coordinates[0]]);
  }, [selectedBus]);

  const getGoogleMapsLink = (bus) => {
    const coords = bus?.currentLocation?.coordinates || bus?.lastLocation?.coordinates || [85.3240, 27.7172];
    return `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[0]}`;
  };

  return (
    <div className={`relative w-full transition-all duration-300 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 ${
      isFullScreen ? 'fixed inset-0 z-[999] rounded-none h-screen w-screen' : 'h-[580px]'
    }`}>
      
      {/* Layer Switcher */}
      <div className="absolute top-3.5 right-3.5 z-[400] flex items-center space-x-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveLayer('google_streets')}
          className={`px-3 py-1 rounded-xl font-bold transition ${
            activeLayer === 'google_streets' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Google Map
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer('google_hybrid')}
          className={`px-3 py-1 rounded-xl font-bold transition ${
            activeLayer === 'google_hybrid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Satellite
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer('osm_transit')}
          className={`px-3 py-1 rounded-xl font-bold transition ${
            activeLayer === 'osm_transit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          OSM
        </button>
        <button
          type="button"
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <MapContainer
        center={targetMapCenter}
        zoom={selectedBus ? 13 : 8}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapResizer />
        <MapViewController targetCoords={targetMapCenter} zoomLevel={selectedBus ? 13 : 8} />

        <TileLayer
          url={MAP_LAYERS[activeLayer].url}
          attribution={MAP_LAYERS[activeLayer].attribution}
          maxZoom={20}
        />

        {corridorPolyline.length > 1 && (
          <Polyline
            positions={corridorPolyline}
            pathOptions={{ color: '#059669', weight: 5, opacity: 0.85, dashArray: '6, 8' }}
          />
        )}

        {selectedBus?.routeChowks?.map((chowk, idx) => {
          if (!chowk.coordinates || chowk.coordinates.length < 2) return null;
          const pos = [chowk.coordinates[1], chowk.coordinates[0]];
          const isPassed = (selectedBus.currentChowkIndex || 0) >= (chowk.sequence || idx + 1);

          return (
            <Marker
              key={`chowk-${idx}`}
              position={pos}
              icon={createChowkPin(chowk, chowk.sequence || idx + 1, isPassed)}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="font-bold text-emerald-600">Stop #{chowk.sequence || idx + 1}</span>
                  <p className="font-extrabold text-slate-900">{chowk.name}</p>
                  <p className="text-slate-500 font-medium">Stage Fare: NPR {chowk.fareFromStart || 0}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {buses.map((bus) => {
          if (!bus.currentLocation?.coordinates || bus.currentLocation.coordinates.length < 2) return null;
          const [lng, lat] = bus.currentLocation.coordinates;
          const isSelected = selectedBus?._id === bus._id;

          return (
            <Marker
              key={bus._id}
              position={[lat, lng]}
              icon={createBusPin(bus, isSelected)}
              eventHandlers={{
                click: () => onSelectBus && onSelectBus(bus)
              }}
            >
              <Popup>
                <div className="p-2 text-xs space-y-2 min-w-[210px]">
                  <div className="border-b border-slate-100 pb-1 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{bus.busName}</h4>
                      <span className="font-mono text-slate-400 text-[10px]">{bus.busNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">
                      {bus.busType}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <p className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{bus.originDistrict} ➔ {bus.destDistrict}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                      <Gauge className="w-3.5 h-3.5 text-sky-600" />
                      <span>Speed: <b>{bus.currentSpeed || 0} km/h</b></span>
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <a
                      href={getGoogleMapsLink(bus)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-1.5 px-2 rounded-xl text-center flex items-center justify-center space-x-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Google Maps</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onBookSeat && onBookSeat(bus)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-xl text-center shadow-xs transition"
                    >
                      Book Seat (NPR {bus.baseFare})
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {selectedBus && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-900/95 backdrop-blur-xl text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-white">{selectedBus.busName}</h3>
                <span className="font-mono text-emerald-400 text-xs">{selectedBus.busNumber}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Corridor: {selectedBus.originDistrict} ➔ {selectedBus.destDistrict} ({selectedBus.currentSpeed || 0} km/h)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <a
              href={getGoogleMapsLink(selectedBus)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-md flex items-center space-x-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GMap Track</span>
            </a>

            <button
              type="button"
              onClick={() => onBookSeat && onBookSeat(selectedBus)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md"
            >
              Book Seat (NPR {selectedBus.baseFare})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
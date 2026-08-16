import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bus, Play, Square, Gauge, Users, CheckCircle2 } from 'lucide-react';

const DriverConsole = () => {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(45);
  const [passengerCount, setPassengerCount] = useState(20);
  const [crowdStatus, setCrowdStatus] = useState('vacant');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [chowkIndex, setChowkIndex] = useState(0);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await api.get('/buses');
        setBuses(res.data.buses || []);
        if (res.data.buses?.length > 0) setSelectedBusId(res.data.buses[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBuses();
  }, []);

  const selectedBus = buses.find(b => b._id === selectedBusId);

  // GPS Telemetry Emitter
  useEffect(() => {
    let interval;
    if (isTripActive && selectedBus?.routeChowks?.length > 0) {
      interval = setInterval(async () => {
        const nextIndex = (chowkIndex + 1) % selectedBus.routeChowks.length;
        setChowkIndex(nextIndex);
        const [lng, lat] = selectedBus.routeChowks[nextIndex].coordinates;
        const speed = Math.floor(40 + Math.random() * 20);
        setCurrentSpeed(speed);

        try {
          await api.post('/buses/telemetry', {
            busId: selectedBusId,
            latitude: lat,
            longitude: lng,
            speed,
            heading: 90,
            occupancy: passengerCount,
            crowdStatus,
            currentChowkIndex: nextIndex
          });
          setBroadcastMsg(`GPS Active at Chowk: ${selectedBus.routeChowks[nextIndex].name} (${speed} km/h)`);
        } catch (err) {
          console.error(err);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isTripActive, selectedBusId, chowkIndex, passengerCount, crowdStatus, selectedBus]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transit Driver Telematics Console</h1>
        <p className="text-xs text-slate-500 mt-1">
          Logged in as: <span className="font-semibold text-amber-600">{user?.name}</span> ({user?.phone || 'Driver'})
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Vehicle</label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            disabled={isTripActive}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            {buses.map(b => (
              <option key={b._id} value={b._id}>
                {b.busNumber} - {b.busName} ({b.originChowk} ➔ {b.destinationChowk})
              </option>
            ))}
          </select>
        </div>

        {/* Crowding Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Crowd / Seating Status</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'vacant', label: '🟢 Seats Available' },
              { id: 'moderate', label: '🟡 Standing Only' },
              { id: 'full', label: '🔴 Full / Packed' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCrowdStatus(item.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  crowdStatus === item.id ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* HUD Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">GPS Speed</span>
              <Gauge className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {isTripActive ? currentSpeed : 0} <span className="text-xs font-normal">km/h</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Passenger Count</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <button onClick={() => setPassengerCount(Math.max(0, passengerCount - 1))} className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded font-bold">-</button>
              <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{passengerCount}</span>
              <button onClick={() => setPassengerCount(passengerCount + 1)} className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded font-bold">+</button>
            </div>
          </div>
        </div>

        {broadcastMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-mono">{broadcastMsg}</span>
          </div>
        )}

        <div>
          {!isTripActive ? (
            <button
              onClick={() => setIsTripActive(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Trip & Broadcast Chowk GPS</span>
            </button>
          ) : (
            <button
              onClick={() => setIsTripActive(false)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>End Trip & Stop Telemetry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverConsole;
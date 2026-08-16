import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { REGION_DATA } from '../data/regions';
import { Bus, Plus, Trash2, X, CheckCircle2, AlertCircle, MapPin, ArrowRight, Route, Navigation } from 'lucide-react';

const AddBusModal = ({ isOpen, onClose, onBusAdded }) => {
  if (!isOpen) return null;

  // Vehicle Profile
  const [busNumber, setBusNumber] = useState('');
  const [busName, setBusName] = useState('Sajha Yatayat');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [busType, setBusType] = useState('AC Deluxe');
  const [capacity, setCapacity] = useState(40);
  const [baseFare, setBaseFare] = useState(650);
  const [contactPhone, setContactPhone] = useState('+977 9851000000');
  const [driverId, setDriverId] = useState('');
  const [driversList, setDriversList] = useState([]);

  // Origin Location State
  const [originCountry, setOriginCountry] = useState('Nepal');
  const [originProvince, setOriginProvince] = useState('Bagmati Province');
  const [originDistrict, setOriginDistrict] = useState('Kathmandu');
  const [originChowk, setOriginChowk] = useState('Gongabu New Bus Park');

  // Destination Location State (Independent of Origin!)
  const [destCountry, setDestCountry] = useState('Nepal');
  const [destProvince, setDestProvince] = useState('Gandaki Province');
  const [destDistrict, setDestDistrict] = useState('Kaski (Pokhara)');
  const [destinationChowk, setDestinationChowk] = useState('Prithvi Chowk');

  // Dynamic Intermediate Highway Chowks
  const [intermediateChowks, setIntermediateChowks] = useState([
    { name: 'Kalanki Chowk', district: 'Kathmandu', minutes: 25, fare: 50 },
    { name: 'Malekhu Chowk', district: 'Dhading', minutes: 120, fare: 250 },
    { name: 'Mugling Bazaar Chowk', district: 'Chitwan', minutes: 180, fare: 450 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const res = await api.get('/auth/drivers');
        setDriversList(res.data.drivers || []);
        if (res.data.drivers?.length > 0) setDriverId(res.data.drivers[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    loadDrivers();
  }, []);

  // Compute Route Classification
  const isInterDistrict = originDistrict !== destDistrict;
  const isCrossBorder = originCountry !== destCountry;
  const routeClassification = isCrossBorder 
    ? 'Inter-State / Cross-Border' 
    : isInterDistrict 
      ? 'Inter-District Highway Express' 
      : 'Local City Transit';

  const handleAddChowk = () => {
    setIntermediateChowks([
      ...intermediateChowks,
      { name: '', district: originDistrict, minutes: 60, fare: 100 }
    ]);
  };

  const handleRemoveChowk = (index) => {
    setIntermediateChowks(intermediateChowks.filter((_, i) => i !== index));
  };

  const handleChowkChange = (index, field, value) => {
    const updated = [...intermediateChowks];
    updated[index][field] = value;
    setIntermediateChowks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const defaultOriginCoords = originCountry === 'India' ? [77.2090, 28.6139] : [85.3120, 27.7340];
      const defaultDestCoords = destCountry === 'India' ? [85.1376, 25.5941] : [83.9856, 28.2096];

      const fullRouteChowks = [
        { 
          name: originChowk, 
          district: originDistrict, 
          sequence: 1, 
          coordinates: defaultOriginCoords, 
          estimatedMinutesFromStart: 0, 
          fareFromStart: 0 
        },
        ...intermediateChowks.map((c, i) => ({
          name: c.name,
          district: c.district || originDistrict,
          sequence: i + 2,
          coordinates: [defaultOriginCoords[0] + (i + 1) * 0.06, defaultOriginCoords[1] + (i + 1) * 0.04],
          estimatedMinutesFromStart: Number(c.minutes) || 30,
          fareFromStart: Number(c.fare) || 50
        })),
        { 
          name: destinationChowk, 
          district: destDistrict, 
          sequence: intermediateChowks.length + 2, 
          coordinates: defaultDestCoords, 
          estimatedMinutesFromStart: 300, 
          fareFromStart: Number(baseFare) 
        }
      ];

      const payload = {
        busNumber: busNumber.trim(),
        busName: busName.trim(),
        registrationNumber: registrationNumber.trim(),
        originCountry,
        originProvince,
        originDistrict,
        originChowk: originChowk.trim(),
        destCountry,
        destProvince,
        destDistrict,
        destinationChowk: destinationChowk.trim(),
        busType,
        baseFare: Number(baseFare),
        capacity: Number(capacity),
        contactPhone,
        driverId: driverId || null,
        routeChowks: fullRouteChowks
      };

      const res = await api.post('/buses', payload);
      setSuccess('Bus registered successfully with full inter-district route!');
      setTimeout(() => {
        setSuccess('');
        onClose();
        if (onBusAdded) onBusAdded(res.data.bus);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register bus.');
    } finally {
      setLoading(false);
    }
  };

  // Helper lists
  const originProvinces = Object.keys(REGION_DATA[originCountry]?.provinces || {});
  const originDistricts = Object.keys(REGION_DATA[originCountry]?.provinces[originProvince] || {});
  const originChowks = REGION_DATA[originCountry]?.provinces[originProvince]?.[originDistrict] || [];

  const destProvinces = Object.keys(REGION_DATA[destCountry]?.provinces || {});
  const destDistricts = Object.keys(REGION_DATA[destCountry]?.provinces[destProvince] || {});
  const destChowks = REGION_DATA[destCountry]?.provinces[destProvince]?.[destDistrict] || [];

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400 mb-1">
          <Bus className="w-6 h-6" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register Public / Highway Fleet Bus</h2>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Configure multi-district origins, destinations, and intermediate highway chowk stops.
        </p>

        {/* Route Type Indicator Badge */}
        <div className="mb-4 flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <Route className="w-4 h-4 text-emerald-600" />
            <span>Route Classification:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              {routeClassification}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
            {originDistrict} ➔ {destDistrict}
          </span>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Vehicle Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bus Line / Operator</label>
              <input
                type="text"
                required
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                placeholder="e.g. Sajha Yatayat, Dhaulagiri"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bus Code Number</label>
              <input
                type="text"
                required
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="e.g. BA-01-KHA-8822"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Plate Number</label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="BA 2 KHA 8822"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* DUAL ORIGIN & DESTINATION LOCATION BOXES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* 📍 STARTING POINT (ORIGIN) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                <MapPin className="w-4 h-4" />
                <span>1. Starting Point (Origin Location)</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Country</label>
                  <select
                    value={originCountry}
                    onChange={(e) => {
                      setOriginCountry(e.target.value);
                      const provs = Object.keys(REGION_DATA[e.target.value]?.provinces || {});
                      setOriginProvince(provs[0] || '');
                      const dists = Object.keys(REGION_DATA[e.target.value]?.provinces[provs[0]] || {});
                      setOriginDistrict(dists[0] || '');
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-bold"
                  >
                    <option value="Nepal">🇳🇵 Nepal</option>
                    <option value="India">🇮🇳 India</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Province / State</label>
                  <select
                    value={originProvince}
                    onChange={(e) => {
                      setOriginProvince(e.target.value);
                      const dists = Object.keys(REGION_DATA[originCountry]?.provinces[e.target.value] || {});
                      setOriginDistrict(dists[0] || '');
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5"
                  >
                    {originProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">District</label>
                  <select
                    value={originDistrict}
                    onChange={(e) => {
                      setOriginDistrict(e.target.value);
                      const ch = REGION_DATA[originCountry]?.provinces[originProvince]?.[e.target.value] || [];
                      if (ch.length > 0) setOriginChowk(ch[0]);
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-semibold text-emerald-600"
                  >
                    {originDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Boarding Chowk / Terminal Name
                </label>
                <input
                  type="text"
                  list="origin-chowk-options"
                  required
                  value={originChowk}
                  onChange={(e) => setOriginChowk(e.target.value)}
                  placeholder="e.g. Gongabu New Bus Park, Lagankhel..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
                <datalist id="origin-chowk-options">
                  {originChowks.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            {/* 🎯 DESTINATION POINT (CAN BE ANY OTHER DISTRICT/COUNTRY) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-sky-600 font-bold">
                <Navigation className="w-4 h-4" />
                <span>2. Destination Point (Ending Location)</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Country</label>
                  <select
                    value={destCountry}
                    onChange={(e) => {
                      setDestCountry(e.target.value);
                      const provs = Object.keys(REGION_DATA[e.target.value]?.provinces || {});
                      setDestProvince(provs[0] || '');
                      const dists = Object.keys(REGION_DATA[e.target.value]?.provinces[provs[0]] || {});
                      setDestDistrict(dists[0] || '');
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-bold"
                  >
                    <option value="Nepal">🇳🇵 Nepal</option>
                    <option value="India">🇮🇳 India</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Province / State</label>
                  <select
                    value={destProvince}
                    onChange={(e) => {
                      setDestProvince(e.target.value);
                      const dists = Object.keys(REGION_DATA[destCountry]?.provinces[e.target.value] || {});
                      setDestDistrict(dists[0] || '');
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5"
                  >
                    {destProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">District</label>
                  <select
                    value={destDistrict}
                    onChange={(e) => {
                      setDestDistrict(e.target.value);
                      const ch = REGION_DATA[destCountry]?.provinces[destProvince]?.[e.target.value] || [];
                      if (ch.length > 0) setDestinationChowk(ch[0]);
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-semibold text-sky-600"
                  >
                    {destDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dropping Chowk / Terminal Name
                </label>
                <input
                  type="text"
                  list="dest-chowk-options"
                  required
                  value={destinationChowk}
                  onChange={(e) => setDestinationChowk(e.target.value)}
                  placeholder="e.g. Prithvi Chowk (Pokhara), Birgunj..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                />
                <datalist id="dest-chowk-options">
                  {destChowks.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

          </div>

          {/* Pricing, Capacity, Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Class</label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
              >
                <option value="AC Deluxe">AC Deluxe</option>
                <option value="Super Deluxe">Super Deluxe</option>
                <option value="Sleeper Coach">Sleeper Coach</option>
                <option value="Express">Express</option>
                <option value="Standard Local">Standard Local</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Seating Capacity</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Total Full Fare ({originCountry === 'Nepal' ? 'NPR' : 'INR'})</label>
              <input
                type="number"
                required
                value={baseFare}
                onChange={(e) => setBaseFare(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold text-emerald-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Driver Phone Number</label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+977 98510..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono"
              />
            </div>
          </div>

          {/* Intermediate Highway Stops */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Intermediate Highway Chowk Stops (Cross-District Nodes)
              </span>
              <button
                type="button"
                onClick={handleAddChowk}
                className="text-emerald-600 font-bold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            {intermediateChowks.map((chowk, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-[10px]">
                  {idx + 2}
                </span>
                <input
                  type="text"
                  placeholder="Chowk Name (e.g. Mugling)"
                  value={chowk.name}
                  onChange={(e) => handleChowkChange(idx, 'name', e.target.value)}
                  className="flex-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5"
                />
                <input
                  type="text"
                  placeholder="District (e.g. Chitwan)"
                  value={chowk.district}
                  onChange={(e) => handleChowkChange(idx, 'district', e.target.value)}
                  className="w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5"
                />
                <input
                  type="number"
                  placeholder="Mins from start"
                  value={chowk.minutes}
                  onChange={(e) => handleChowkChange(idx, 'minutes', e.target.value)}
                  className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5"
                />
                <input
                  type="number"
                  placeholder="Fare"
                  value={chowk.fare}
                  onChange={(e) => handleChowkChange(idx, 'fare', e.target.value)}
                  className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 font-semibold text-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveChowk(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition shadow-md flex items-center justify-center space-x-2 text-xs"
          >
            <Bus className="w-4 h-4" />
            <span>{loading ? 'Registering Bus...' : 'Save & Publish Bus to Live Fleet Radar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBusModal;
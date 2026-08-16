import React from 'react';
import { useRegion } from '../context/RegionContext';
import { REGION_DATA } from '../data/regions';
import { MapPin, X, Check } from 'lucide-react';

const RegionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { country, province, district, setCountry, setProvince, setDistrict } = useRegion();
  const availableProvinces = Object.keys(REGION_DATA[country]?.provinces || {});
  const availableDistricts = REGION_DATA[country]?.provinces[province] || [];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-4">
          <MapPin className="w-5 h-5" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Change Region & Coverage</h3>
        </div>

        {/* Country Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Country</label>
            <div className="grid grid-cols-2 gap-2">
              {['Nepal', 'India'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountry(c)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition ${
                    country === c
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{REGION_DATA[c].flag}</span>
                  <span>{c}</span>
                  {country === c && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* State / Province */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">State / Province</label>
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                const firstD = REGION_DATA[country]?.provinces[e.target.value]?.[0] || 'all';
                setDistrict(firstD);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            >
              {availableProvinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">District / Zone</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-sm mt-2"
          >
            Apply Regional Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionModal;
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bus, User, Phone, Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, UserCheck, RefreshCw, X } from 'lucide-react';

const AdminDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBusId, setEditBusId] = useState(null);
  const [message, setMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    busNumber: '',
    busName: '',
    registrationNumber: '',
    capacity: 40,
    origin: 'Central Terminal',
    destination: 'Campus Station',
    stateRegion: 'Bagmati / Central',
    driverId: '',
    substituteDriverId: '',
    isDriverAbsent: false,
    status: 'idle'
  });

  const fetchData = async () => {
    try {
      const [busRes, driverRes] = await Promise.all([
        api.get('/buses'),
        api.get('/auth/drivers')
      ]);
      setBuses(busRes.data.buses || []);
      setDrivers(driverRes.data.drivers || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditBusId(null);
    setFormData({
      busNumber: '',
      busName: 'Metro Express',
      registrationNumber: '',
      capacity: 45,
      origin: 'Kathmandu / Central Hub',
      destination: 'Campus Terminal',
      stateRegion: 'Bagmati / Central',
      driverId: drivers[0]?._id || '',
      substituteDriverId: '',
      isDriverAbsent: false,
      status: 'active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (bus) => {
    setEditBusId(bus._id);
    setFormData({
      busNumber: bus.busNumber,
      busName: bus.busName || '',
      registrationNumber: bus.registrationNumber,
      capacity: bus.capacity,
      origin: bus.origin || '',
      destination: bus.destination || '',
      stateRegion: bus.stateRegion || 'Bagmati / Central',
      driverId: bus.driverId?._id || '',
      substituteDriverId: bus.substituteDriverId?._id || '',
      isDriverAbsent: bus.isDriverAbsent || false,
      status: bus.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this bus from the fleet?')) return;
    try {
      await api.delete(`/buses/${id}`);
      setMessage('Bus removed successfully.');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editBusId) {
        await api.put(`/buses/${editBusId}`, formData);
        setMessage('Bus and driver assignment updated.');
      } else {
        await api.post('/buses', formData);
        setMessage('New bus registered to fleet.');
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving bus.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Fleet & Driver Management Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure buses, assign routes, manage driver absences, and deploy substitute personnel.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Fleet Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Bus / Fleet Name</th>
                <th className="p-3.5">Plate & Capacity</th>
                <th className="p-3.5">Origin ➔ Destination</th>
                <th className="p-3.5">Assigned Driver & Phone</th>
                <th className="p-3.5">Driver Status / Substitute</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {buses.map((bus) => (
                <tr key={bus._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{bus.busNumber}</p>
                        <p className="text-[11px] text-slate-400">{bus.busName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="text-slate-900 dark:text-white">{bus.registrationNumber}</span>
                    <span className="text-slate-400 block text-[10px]">{bus.capacity} seats</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-emerald-600 dark:text-emerald-400">{bus.origin}</span>
                    <span className="text-slate-400 block text-[10px]">➔ {bus.destination}</span>
                  </td>
                  <td className="p-3.5">
                    {bus.driverId ? (
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{bus.driverId.name}</span>
                        <span className="text-slate-400 block text-[11px] font-mono">{bus.driverId.phone || 'No phone'}</span>
                      </div>
                    ) : (
                      <span className="text-rose-500 font-semibold">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {bus.isDriverAbsent ? (
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase">
                          Driver Absent
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Substitute: {bus.substituteDriverId?.name || 'Pending assignment'}
                        </p>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-semibold text-[10px]">
                        Primary Active
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(bus)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bus._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              {editBusId ? 'Modify Fleet Bus & Driver Substitution' : 'Add New Fleet Bus'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Bus Number</label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    placeholder="BUS-101"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Bus Name</label>
                  <input
                    type="text"
                    value={formData.busName}
                    onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                    placeholder="Express Superline"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Plate Number</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="BA 2 KHA 4567"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Passenger Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Origin (Start Point)</label>
                  <input
                    type="text"
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Assigned Driver</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.phone || 'No phone'})</option>
                  ))}
                </select>
              </div>

              {/* Driver Absence & Substitute Option */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Is Driver Absent?</span>
                  <input
                    type="checkbox"
                    checked={formData.isDriverAbsent}
                    onChange={(e) => setFormData({ ...formData, isDriverAbsent: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </div>
                {formData.isDriverAbsent && (
                  <div>
                    <label className="block text-[11px] font-medium text-amber-900 dark:text-amber-200 mb-1">
                      Assign Substitute Driver
                    </label>
                    <select
                      value={formData.substituteDriverId}
                      onChange={(e) => setFormData({ ...formData, substituteDriverId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">-- Select Substitute Driver --</option>
                      {drivers.map(d => (
                        <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl text-xs transition mt-3"
              >
                Save Bus & Deploy Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OwnerPayoutModal from '../components/OwnerPayoutModal';
import { 
  Building2, 
  Bus, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  QrCode, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Phone
} from 'lucide-react';

const OperatorHub = () => {
  const { user } = useAuth();
  const [fleet, setFleet] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [selectedBusForPayout, setSelectedBusForPayout] = useState(null);
  const [busModalOpen, setBusModalOpen] = useState(false);
  const [editingBusId, setEditingBusId] = useState(null);
  const [driverModalOpen, setDriverModalOpen] = useState(false);

  // Bus Form State
  const [busForm, setBusForm] = useState({
    busName: '',
    busNumber: '',
    registrationNumber: '',
    originDistrict: 'Kathmandu',
    originChowk: 'Gongabu New Bus Park',
    destDistrict: 'Kaski (Pokhara)',
    destinationChowk: 'Prithvi Chowk',
    busType: 'AC Deluxe',
    baseFare: 750,
    capacity: 40,
    driverId: '',
    contactPhone: ''
  });

  // Driver Recruitment Form
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    password: 'Password123!',
    licenseNumber: '',
    citizenshipNumber: '',
    issuingDistrict: 'Kathmandu',
    yearsOfExperience: 5
  });

  const fetchFleetAndDrivers = async () => {
    try {
      const [fleetRes, driversRes] = await Promise.all([
        api.get('/buses/operator/my-fleet'),
        api.get('/auth/drivers')
      ]);
      setFleet(fleetRes.data.buses || []);
      setDrivers(driversRes.data.drivers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetAndDrivers();
  }, []);

  const handleOpenAddBus = () => {
    setEditingBusId(null);
    setBusForm({
      busName: '',
      busNumber: '',
      registrationNumber: '',
      originDistrict: 'Kathmandu',
      originChowk: 'Gongabu New Bus Park',
      destDistrict: 'Kaski (Pokhara)',
      destinationChowk: 'Prithvi Chowk',
      busType: 'AC Deluxe',
      baseFare: 750,
      capacity: 40,
      driverId: drivers[0]?._id || '',
      contactPhone: user?.phone || ''
    });
    setBusModalOpen(true);
  };

  const handleOpenEditBus = (bus) => {
    setEditingBusId(bus._id);
    setBusForm({
      busName: bus.busName,
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      originDistrict: bus.originDistrict || 'Kathmandu',
      originChowk: bus.originChowk || 'Gongabu New Bus Park',
      destDistrict: bus.destDistrict || 'Kaski (Pokhara)',
      destinationChowk: bus.destinationChowk || 'Prithvi Chowk',
      busType: bus.busType || 'AC Deluxe',
      baseFare: bus.baseFare || 750,
      capacity: bus.capacity || 40,
      driverId: bus.driverId?._id || '',
      contactPhone: bus.contactPhone || ''
    });
    setBusModalOpen(true);
  };

  const handleSaveBus = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingBusId) {
        await api.put(`/buses/${editingBusId}`, busForm);
        setMessage('Bus details updated successfully!');
      } else {
        await api.post('/buses', busForm);
        setMessage('New bus registered to fleet successfully!');
      }
      setBusModalOpen(false);
      fetchFleetAndDrivers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bus.');
    }
  };

  const handleDeleteBus = async (busId, busNumber) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${busNumber} from your fleet?`)) return;

    try {
      await api.delete(`/buses/${busId}`);
      setMessage(`Bus ${busNumber} deleted successfully.`);
      fetchFleetAndDrivers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bus.');
    }
  };

  const handleRecruitDriver = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/recruit-driver', driverForm);
      setMessage(res.data.message);
      setDriverModalOpen(false);
      fetchFleetAndDrivers();
      setDriverForm({
        name: '',
        phone: '',
        password: 'Password123!',
        licenseNumber: '',
        citizenshipNumber: '',
        issuingDistrict: 'Kathmandu',
        yearsOfExperience: 5
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Driver recruitment failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400">
            <Building2 className="w-6 h-6" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Bus Owner & Fleet Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operator: <span className="font-bold text-slate-800 dark:text-slate-200">{user?.operatorKyc?.companyName || user?.name}</span> • Total Fleet: {fleet.length} Buses
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDriverModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>Recruit Driver</span>
          </button>

          <button
            onClick={handleOpenAddBus}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bus</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fleet Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Managed Fleet Vehicles ({fleet.length})
        </h2>

        {fleet.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
            <Bus className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No Buses Registered in Your Fleet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first highway bus with route corridors, ticket pricing, and assign an onboard driver.
            </p>
            <button
              onClick={handleOpenAddBus}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
            >
              + Register New Bus
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fleet.map((bus) => (
              <div
                key={bus._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{bus.busName}</h3>
                      <span className="font-mono text-xs text-slate-400">{bus.busNumber} • {bus.registrationNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {bus.busType}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Route:</span>
                      <span className="font-bold">{bus.originDistrict} ➔ {bus.destDistrict}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Fare:</span>
                      <span className="font-bold font-mono text-emerald-600">NPR {bus.baseFare}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Driver:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{bus.driverId?.name || 'Unassigned'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">QR / Bank:</span>
                      <span className="font-bold text-sky-600">
                        {bus.payoutDetails?.qrCodeImage ? '✓ Custom QR Set' : bus.payoutDetails?.accountNumber ? '✓ Bank Configured' : '● Not Configured'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedBusForPayout(bus)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Set Payment QR & Bank</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBus(bus)}
                      className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBus(bus._id, bus.busNumber)}
                      className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Bus Modal */}
      {busModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setBusModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Bus className="w-5 h-5 text-emerald-600" />
              <span>{editingBusId ? 'Modify Fleet Bus' : 'Register New Bus'}</span>
            </h3>

            <form onSubmit={handleSaveBus} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Bus Line Name</label>
                <input
                  type="text"
                  required
                  value={busForm.busName}
                  onChange={(e) => setBusForm({ ...busForm, busName: e.target.value })}
                  placeholder="e.g. Dhaulagiri Super Deluxe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Bus Code</label>
                  <input
                    type="text"
                    required
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    placeholder="BA-01-KHA-8822"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Plate Number</label>
                  <input
                    type="text"
                    required
                    value={busForm.registrationNumber}
                    onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
                    placeholder="BA 2 KHA 8822"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Origin City/Chowk</label>
                  <input
                    type="text"
                    required
                    value={busForm.originDistrict}
                    onChange={(e) => setBusForm({ ...busForm, originDistrict: e.target.value, originChowk: e.target.value })}
                    placeholder="Kathmandu"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Destination City/Chowk</label>
                  <input
                    type="text"
                    required
                    value={busForm.destDistrict}
                    onChange={(e) => setBusForm({ ...busForm, destDistrict: e.target.value, destinationChowk: e.target.value })}
                    placeholder="Pokhara"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Base Fare (NPR)</label>
                  <input
                    type="number"
                    required
                    value={busForm.baseFare}
                    onChange={(e) => setBusForm({ ...busForm, baseFare: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Seats</label>
                  <input
                    type="number"
                    required
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Class</label>
                  <select
                    value={busForm.busType}
                    onChange={(e) => setBusForm({ ...busForm, busType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                  >
                    <option value="AC Deluxe">AC Deluxe</option>
                    <option value="Luxury Sleeper">Luxury Sleeper</option>
                    <option value="Super Deluxe">Super Deluxe</option>
                    <option value="Express">Express</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assign Driver</label>
                <select
                  value={busForm.driverId}
                  onChange={(e) => setBusForm({ ...busForm, driverId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBusModalOpen(false)}
                  className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 rounded-xl py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl"
                >
                  {editingBusId ? 'Update Bus' : 'Save & Register Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {selectedBusForPayout && (
        <OwnerPayoutModal
          isOpen={!!selectedBusForPayout}
          bus={selectedBusForPayout}
          onClose={() => setSelectedBusForPayout(null)}
          onUpdated={() => fetchFleetAndDrivers()}
        />
      )}

      {/* Driver Recruitment Modal */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Onboard Fleet Driver</span>
            </h3>

            <form onSubmit={handleRecruitDriver} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Driver Name</label>
                <input
                  type="text"
                  required
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  placeholder="e.g. Ram Bahadur Thapa"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Driver Phone</label>
                <input
                  type="tel"
                  required
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  placeholder="+977 9841890011"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">License No.</label>
                  <input
                    type="text"
                    required
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    placeholder="01-06-00998812"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Citizenship No.</label>
                  <input
                    type="text"
                    required
                    value={driverForm.citizenshipNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, citizenshipNumber: e.target.value })}
                    placeholder="34-01-72-88771"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDriverModalOpen(false)}
                  className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 rounded-xl py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl"
                >
                  Onboard Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OperatorHub;
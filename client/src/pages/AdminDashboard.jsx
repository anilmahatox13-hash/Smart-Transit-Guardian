import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Bus, 
  Building2, 
  RefreshCw,
  Search,
  User
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  const fetchComplianceData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/buses');
      setBuses(res.data.buses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch compliance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleVerifyBus = async (busId, status) => {
    setActionMessage('');
    setError('');
    try {
      const res = await api.patch(`/buses/${busId}/verify`, {
        status,
        remarks: status === 'verified' ? 'Verified by Transport Authority' : 'KYC Rejected - Incomplete documents'
      });
      setActionMessage(res.data.message);
      fetchComplianceData();
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization failed. Please ensure you are logged in as Authority/Admin.');
    }
  };

  const filteredBuses = buses.filter(b => {
    if (filter === 'pending') return b.verificationStatus === 'pending';
    if (filter === 'verified') return b.verificationStatus === 'verified';
    return true;
  }).filter(b => 
    b.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-6 h-6" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Transport Authority Compliance Hub</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Officer: <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name}</span> ({user?.governmentId?.idNumber || 'GOV-AUTH-01'})
          </p>
        </div>

        <button
          onClick={fetchComplianceData}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Total Registered Fleet</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{buses.length}</p>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl shadow-xs">
          <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">Pending KYC Approvals</span>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {buses.filter(b => b.verificationStatus === 'pending').length}
          </p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-3xl shadow-xs">
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Verified Active Fleet</span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {buses.filter(b => b.verificationStatus === 'verified').length}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
          {['all', 'pending', 'verified'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                filter === t ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Plate, Permit or Name..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Compliance List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Bus & Operator Details</th>
                <th className="p-4">Route Corridor</th>
                <th className="p-4">Mandatory KYC Proofs</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Authority Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredBuses.map((bus) => (
                <tr key={bus._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{bus.busName}</p>
                    <span className="font-mono text-slate-400">{bus.busNumber} • {bus.registrationNumber}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Operator: {bus.operatorId?.name || 'Private Operator'}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-emerald-600">{bus.originDistrict} ➔ {bus.destDistrict}</p>
                    <span className="text-[11px] text-slate-400">Fare: NPR {bus.baseFare}</span>
                  </td>
                  <td className="p-4 space-y-1 font-mono text-[11px]">
                    <p>📄 Bluebook: <span className="text-slate-800 dark:text-slate-200 font-bold">{bus.bluebookNumber || 'BB-N/A'}</span></p>
                    <p>🛣️ Route Permit: <span className="text-slate-800 dark:text-slate-200 font-bold">{bus.routePermitNumber || 'RP-N/A'}</span></p>
                    <p>🛡️ Insurance: <span className="text-slate-800 dark:text-slate-200">{bus.insurancePolicyNumber || 'INS-N/A'}</span></p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                      bus.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}>
                      {bus.verificationStatus === 'verified' ? '✓ APPROVED' : '● PENDING KYC'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {bus.verificationStatus !== 'verified' ? (
                        <button
                          onClick={() => handleVerifyBus(bus._id, 'verified')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve KYC</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyBus(bus._id, 'pending')}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bus, ShieldCheck, Check, X, AlertCircle, FileText, CheckCircle2, User, Clock, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compliance'); // 'compliance' | 'all'
  const [rejectModalBus, setRejectModalBus] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchComplianceData = async () => {
    try {
      const res = await api.get('/buses/admin/compliance');
      setBuses(res.data.buses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleVerify = async (id, status, reason = '') => {
    try {
      await api.patch(`/buses/${id}/verify`, { status, rejectionReason: reason });
      setActionMsg(`Bus status updated to ${status}.`);
      setRejectModalBus(null);
      setRejectReason('');
      fetchComplianceData();
      setTimeout(() => setActionMsg(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  const pendingBuses = buses.filter(b => b.verificationStatus === 'pending_verification');
  const displayedBuses = activeTab === 'compliance' ? pendingBuses : buses;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Compliance & KYC Verification Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review bus owner documents, enforce road permit regulations, and authorize live GPS radar access.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'compliance' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            Pending KYC Approval ({pendingBuses.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
            }`}
          >
            All Fleet Inventory ({buses.length})
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Compliance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Bus & Owner</th>
                <th className="p-3.5">Route & Fare</th>
                <th className="p-3.5">Bluebook & Route Permit</th>
                <th className="p-3.5">Insurance Policy</th>
                <th className="p-3.5">KYC Status</th>
                <th className="p-3.5 text-right">Compliance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {displayedBuses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No pending vehicle verifications found. All fleet vehicles are verified.
                  </td>
                </tr>
              ) : (
                displayedBuses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{bus.busName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{bus.busNumber} • {bus.registrationNumber}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Owner: {bus.operatorId?.name || 'Authorized Samiti'}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-emerald-600">{bus.originDistrict} ➔ {bus.destDistrict}</p>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">Fare: NPR {bus.baseFare}</p>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] space-y-0.5">
                      <p>RC: <span className="font-bold text-slate-800 dark:text-slate-200">{bus.documents?.bluebookNumber || 'N/A'}</span></p>
                      <p>Permit: <span className="font-bold text-slate-800 dark:text-slate-200">{bus.documents?.routePermitNumber || 'N/A'}</span></p>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{bus.documents?.insurancePolicyNumber || 'N/A'}</span>
                    </td>
                    <td className="p-3.5">
                      {bus.verificationStatus === 'verified' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-[10px]">
                          ✓ Verified
                        </span>
                      ) : bus.verificationStatus === 'rejected' ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-[10px]">
                          ✕ Rejected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 font-bold text-[10px]">
                          ● Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {bus.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleVerify(bus._id, 'verified')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center space-x-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {bus.verificationStatus !== 'rejected' && (
                        <button
                          onClick={() => setRejectModalBus(bus)}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center space-x-1 shadow-2xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalBus && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Reject Vehicle KYC Verification</h3>
            <p className="text-xs text-slate-500 mb-3">Provide a clear reason (e.g. invalid Bluebook or expired insurance policy):</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Expired route permit number, vehicle plate mismatch..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none mb-4"
            ></textarea>
            <div className="flex space-x-2">
              <button
                onClick={() => setRejectModalBus(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectModalBus._id, 'rejected', rejectReason)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
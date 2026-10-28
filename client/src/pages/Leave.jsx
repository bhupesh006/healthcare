import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertCircle, CheckCircle2, XCircle, Clock, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState({});
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves');
      setLeaves(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaves', error);
      setLoading(false);
    }
  };

  const checkImpact = async (leaveId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/${leaveId}/impact`);
      setImpactData(prev => ({ ...prev, [leaveId]: res.data }));
    } catch (error) {
      console.error('Error checking impact', error);
    }
  };

  const handleAction = async (leaveId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${leaveId}/status`, { status });
      fetchLeaves();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': 
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Pending Review</span>;
      case 'APPROVED': 
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Approved</span>;
      case 'REJECTED': 
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">Rejected</span>;
      default: 
        return null;
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (activeFilter === 'ALL') return true;
    return l.status === activeFilter;
  });

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Staff Leave & Absence Management
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              {pendingCount} Pending Approval
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: `All Requests (${leaves.length})` },
          { key: 'PENDING', label: `Pending (${pendingCount})` },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === tab.key
                ? 'bg-[#00a8b5] text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7fcfd] border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="p-4 pl-6">Clinical Staff</th>
                <th className="p-4">Leave Category</th>
                <th className="p-4">Duration & Dates</th>
                <th className="p-4">Status</th>
                <th className="p-4">Roster Collision Impact</th>
                <th className="p-4 pr-6 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading leave requests...</td></tr>
              ) : filteredLeaves.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No leave requests found for this filter.</td></tr>
              ) : filteredLeaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#e6f8fa] text-[#00828e] font-bold text-xs flex items-center justify-center">
                        {leave.staff?.fullName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{leave.staff?.fullName}</p>
                        <p className="text-[11px] text-slate-400">{leave.staff?.role} • {leave.staff?.department?.name || 'Emergency'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span>
                        {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(leave.status)}</td>
                  <td className="p-4">
                    {leave.status === 'PENDING' ? (
                      impactData[leave._id] ? (
                        <div className={`text-xs p-2.5 rounded-xl flex items-start gap-2 ${
                          impactData[leave._id].overlappingShiftsCount > 0 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {impactData[leave._id].overlappingShiftsCount > 0 
                            ? <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-600" /> 
                            : <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />}
                          <span className="font-medium">{impactData[leave._id].warning}</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => checkImpact(leave._id)}
                          className="text-xs font-bold text-[#00828e] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={13} />
                          <span>Run Impact Check</span>
                        </button>
                      )
                    ) : (
                      <span className="text-slate-400 font-medium">Evaluation Finalized</span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {leave.status === 'PENDING' && (
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleAction(leave._id, 'APPROVED')}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          title="Approve Leave"
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => handleAction(leave._id, 'REJECTED')}
                          className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          title="Reject Leave"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
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

export default Leave;

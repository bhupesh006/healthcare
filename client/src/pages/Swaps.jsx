import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle2, XCircle, User, Calendar, ArrowRight, Clock, Building2, Check, X } from 'lucide-react';

const Swaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/swaps');
      setSwaps(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching swaps', error);
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/swaps/${id}/status`, { status });
      fetchSwaps();
    } catch (error) {
      console.error('Error updating swap status', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': 
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Pending Colleague</span>;
      case 'ACCEPTED_BY_STAFF': 
        return <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">Colleague Accepted</span>;
      case 'APPROVED': 
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Manager Approved</span>;
      case 'REJECTED': 
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">Declined</span>;
      default: 
        return null;
    }
  };

  const filteredSwaps = swaps.filter(s => {
    if (activeFilter === 'ALL') return true;
    return s.status === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shift Swap Orchestration
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              {swaps.length} Requests
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: `All Swaps (${swaps.length})` },
          { key: 'ACCEPTED_BY_STAFF', label: 'Ready for Manager Approval' },
          { key: 'PENDING', label: 'Pending Staff' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Declined' },
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

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7fcfd] border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="p-4 pl-6">Shift Details</th>
                <th className="p-4">Swap Exchange (From ➔ To)</th>
                <th className="p-4">Justification</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Manager Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading swap requests...</td></tr>
              ) : filteredSwaps.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No shift swap records found.</td></tr>
              ) : filteredSwaps.map((swap) => (
                <tr key={swap._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[11px] mb-1">
                        {swap.shift?.department?.code || 'WARD'} • {swap.shift?.shiftType}
                      </span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#00a8b5]"/>
                        {new Date(swap.shift?.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-slate-400" />
                        {swap.shift?.startTime} – {swap.shift?.endTime}
                      </p>
                    </div>
                  </td>
                  
                  {/* Exchange visual */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="font-bold text-slate-900">{swap.requester?.fullName}</p>
                        <p className="text-[10px] text-slate-400">{swap.requester?.role}</p>
                      </div>
                      <div className="p-1 rounded-full bg-[#e6f8fa] text-[#00828e]">
                        <ArrowRight size={14} />
                      </div>
                      <div className="p-2 rounded-xl bg-[#f0fafb] border border-[#d2f0f4]">
                        <p className="font-bold text-[#00828e]">{swap.replacement?.fullName}</p>
                        <p className="text-[10px] text-[#00828e]/70">{swap.replacement?.role}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-xs text-slate-600 max-w-[200px] truncate" title={swap.reason}>
                    <span className="italic">{swap.reason || 'Personal schedule adjustment'}</span>
                  </td>

                  <td className="p-4">
                    {getStatusBadge(swap.status)}
                  </td>

                  <td className="p-4 pr-6 text-right">
                    {(swap.status === 'PENDING' || swap.status === 'ACCEPTED_BY_STAFF') && (
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleAction(swap._id, 'APPROVED')}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          title="Approve Swap"
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => handleAction(swap._id, 'REJECTED')}
                          className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          title="Decline Swap"
                        >
                          <X size={14} />
                          <span>Decline</span>
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

export default Swaps;

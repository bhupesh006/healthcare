import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, XCircle, User, Calendar } from 'lucide-react';

const Swaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

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
      case 'PENDING': return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Pending</span>;
      case 'ACCEPTED_BY_STAFF': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Staff Accepted</span>;
      case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Approved</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shift Swaps</h1>
          <p className="text-slate-500">Manage and approve shift replacement requests</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <RefreshCw size={18} />
          <span>New Swap Request</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Shift Details</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Original Staff</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Replacement</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Reason</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">Loading swap requests...</td></tr>
              ) : swaps.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">No shift swap requests found.</td></tr>
              ) : swaps.map((swap) => (
                <tr key={swap._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400"/>
                      {new Date(swap.shift?.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 ml-5">{swap.shift?.shiftType} ({swap.shift?.startTime} - {swap.shift?.endTime})</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      <User size={14} className="text-red-400"/>
                      {swap.requester?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 ml-5">{swap.requester?.role}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      <User size={14} className="text-green-400"/>
                      {swap.replacement?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 ml-5">{swap.replacement?.role}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={swap.reason}>
                    {swap.reason || '-'}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(swap.status)}
                  </td>
                  <td className="p-4 text-right">
                    {(swap.status === 'PENDING' || swap.status === 'ACCEPTED_BY_STAFF') && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(swap._id, 'APPROVED')}
                          className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-semibold border border-green-200 transition-colors"
                        >
                          Approve Swap
                        </button>
                        <button 
                          onClick={() => handleAction(swap._id, 'REJECTED')}
                          className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-semibold border border-red-200 transition-colors"
                        >
                          Reject
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

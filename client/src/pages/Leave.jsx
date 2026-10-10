import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState({});

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
      case 'PENDING': return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Pending</span>;
      case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Approved</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500">Review and approve staff time off</p>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Staff</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Type</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Duration</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Impact Analysis</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">Loading leave requests...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">No leave requests found.</td></tr>
              ) : leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{leave.staff?.fullName}</p>
                    <p className="text-xs text-slate-500">{leave.staff?.role}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-700">{leave.leaveType}</td>
                  <td className="p-4 text-sm text-slate-700">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">{getStatusBadge(leave.status)}</td>
                  <td className="p-4">
                    {leave.status === 'PENDING' && (
                      impactData[leave._id] ? (
                        <div className={`text-xs p-2 rounded flex items-start gap-2 ${impactData[leave._id].overlappingShiftsCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                          {impactData[leave._id].overlappingShiftsCount > 0 ? <AlertCircle size={14} className="mt-0.5 shrink-0" /> : <CheckCircle size={14} className="mt-0.5 shrink-0" />}
                          <span>{impactData[leave._id].warning}</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => checkImpact(leave._id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Check Staffing Impact
                        </button>
                      )
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {leave.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(leave._id, 'APPROVED')}
                          className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(leave._id, 'REJECTED')}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
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

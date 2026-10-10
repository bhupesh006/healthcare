import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, Calendar, User, AlertCircle } from 'lucide-react';

const StaffSwaps = () => {
  const { user } = useContext(AuthContext);
  const [swaps, setSwaps] = useState([]);
  const [myShifts, setMyShifts] = useState([]);
  const [eligibleStaff, setEligibleStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    shift: '',
    replacement: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [swapsRes, shiftsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/swaps'),
        axios.get('http://localhost:5000/api/shifts')
      ]);

      const staffIdStr = user.staffId?._id || user.staffId;

      const mySwaps = swapsRes.data.filter(s => 
        s.requester?._id === staffIdStr || s.replacement?._id === staffIdStr
      );
      setSwaps(mySwaps);

      const assignedShifts = shiftsRes.data.filter(shift => 
        shift.assignedStaff.some(staff => (staff._id || staff) === staffIdStr) &&
        new Date(shift.date) >= new Date(new Date().setHours(0,0,0,0))
      );
      setMyShifts(assignedShifts);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
      setLoading(false);
    }
  };

  const handleShiftSelect = async (e) => {
    const shiftId = e.target.value;
    setFormData({ ...formData, shift: shiftId, replacement: '' });
    
    if (shiftId) {
      try {
        const res = await axios.get(`http://localhost:5000/api/shifts/${shiftId}/eligible-staff`);
        setEligibleStaff(res.data.eligibleStaff || []);
      } catch (error) {
        console.error('Error fetching eligible staff', error);
      }
    } else {
      setEligibleStaff([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/swaps', {
        shift: formData.shift,
        requester: user.staffId?._id || user.staffId,
        replacement: formData.replacement,
        reason: formData.reason
      });
      setShowForm(false);
      setFormData({ shift: '', replacement: '', reason: '' });
      fetchData();
      alert('Swap request submitted successfully!');
    } catch (error) {
      console.error('Error submitting swap request', error);
      alert(error.response?.data?.message || 'Error submitting swap request');
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
          <h1 className="text-2xl font-bold text-slate-900">My Shift Swaps</h1>
          <p className="text-slate-500">Request and manage your shift swaps</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} />
          <span>{showForm ? 'Cancel Request' : 'Request Swap'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">New Swap Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Shift to Swap</label>
                <select 
                  required
                  value={formData.shift} 
                  onChange={handleShiftSelect}
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">-- Select Shift --</option>
                  {myShifts.map(shift => (
                    <option key={shift._id} value={shift._id}>
                      {new Date(shift.date).toLocaleDateString()} - {shift.shiftType} ({shift.startTime} to {shift.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select Replacement Staff</label>
                <select 
                  required
                  value={formData.replacement} 
                  onChange={(e) => setFormData({...formData, replacement: e.target.value})}
                  disabled={!formData.shift || eligibleStaff.length === 0}
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-100"
                >
                  <option value="">-- Select Staff --</option>
                  {eligibleStaff.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.fullName} ({staff.role})
                    </option>
                  ))}
                </select>
                {formData.shift && eligibleStaff.length === 0 && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> No eligible staff found for this shift.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reason for Swap</label>
              <textarea 
                required
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Briefly explain why you need to swap..."
                className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none h-24"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={!formData.shift || !formData.replacement || !formData.reason}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Shift Details</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Role in Swap</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Other Person</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Reason</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">Loading swap requests...</td></tr>
              ) : swaps.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">No shift swap requests found.</td></tr>
              ) : swaps.map((swap) => {
                const staffIdStr = user.staffId?._id || user.staffId;
                const isRequester = swap.requester?._id === staffIdStr;
                const otherPerson = isRequester ? swap.replacement : swap.requester;
                
                return (
                  <tr key={swap._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400"/>
                        {new Date(swap.shift?.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500 ml-5">{swap.shift?.shiftType} ({swap.shift?.startTime} - {swap.shift?.endTime})</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      {isRequester ? 'Requester' : 'Replacement'}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900 flex items-center gap-2">
                        <User size={14} className={isRequester ? "text-green-400" : "text-red-400"}/>
                        {otherPerson?.fullName}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={swap.reason}>
                      {swap.reason || '-'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(swap.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffSwaps;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, Calendar, User, AlertCircle, Plus, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

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
      case 'PENDING': 
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Pending Colleague</span>;
      case 'ACCEPTED_BY_STAFF': 
        return <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">Staff Accepted</span>;
      case 'APPROVED': 
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Approved</span>;
      case 'REJECTED': 
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">Rejected</span>;
      default: 
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Shift Swaps
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              Peer Exchange
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={16} />
          <span>{showForm ? 'Close Form' : 'Request New Swap'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80 animate-fadeIn">
          <h2 className="text-lg font-bold text-slate-900 mb-1">New Shift Swap Request</h2>
          <p className="text-xs text-slate-500 mb-5">Select one of your assigned shifts and choose an accredited peer replacement.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Shift to Swap
                </label>
                <select 
                  required
                  value={formData.shift} 
                  onChange={handleShiftSelect}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                >
                  <option value="">-- Choose Assigned Shift --</option>
                  {myShifts.map(shift => (
                    <option key={shift._id} value={shift._id}>
                      {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} - {shift.shiftType} ({shift.startTime} to {shift.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Accredited Peer
                </label>
                <select 
                  required
                  value={formData.replacement} 
                  onChange={(e) => setFormData({...formData, replacement: e.target.value})}
                  disabled={!formData.shift || eligibleStaff.length === 0}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">-- Select Qualified Replacement --</option>
                  {eligibleStaff.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.fullName} ({staff.role})
                    </option>
                  ))}
                </select>
                {formData.shift && eligibleStaff.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> No available accredited staff found for this slot.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Reason for Swap
              </label>
              <textarea 
                required
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Briefly state reason for shift exchange..."
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none h-24"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={!formData.shift || !formData.replacement || !formData.reason}
                className="bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                Transmit Swap Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7fcfd] border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="p-4 pl-6">Shift Details</th>
                <th className="p-4">My Role</th>
                <th className="p-4">Counterpart Staff</th>
                <th className="p-4">Reason</th>
                <th className="p-4 pr-6">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading swap records...</td></tr>
              ) : swaps.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No shift swap records active.</td></tr>
              ) : swaps.map((swap) => {
                const staffIdStr = user.staffId?._id || user.staffId;
                const isRequester = swap.requester?._id === staffIdStr;
                const otherPerson = isRequester ? swap.replacement : swap.requester;
                
                return (
                  <tr key={swap._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#00a8b5]"/>
                        {new Date(swap.shift?.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {swap.shift?.shiftType} ({swap.shift?.startTime} – {swap.shift?.endTime})
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isRequester ? 'bg-amber-100 text-amber-800' : 'bg-[#e6f8fa] text-[#00828e]'
                      }`}>
                        {isRequester ? 'Initiated by You' : 'Incoming Request'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <User size={13} className="text-slate-400"/>
                        {otherPerson?.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400">{otherPerson?.role}</p>
                    </td>
                    <td className="p-4 text-xs text-slate-600 max-w-[200px] truncate" title={swap.reason}>
                      {swap.reason || '-'}
                    </td>
                    <td className="p-4 pr-6">
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

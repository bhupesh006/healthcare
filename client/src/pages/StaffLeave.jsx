import React, { useState, useContext } from 'react';
import { FileText, Upload, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StaffLeave = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'Sick Leave',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/leaves', {
        staff: user.staffId,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'PENDING'
      });
      setSuccess(true);
      setFormData({ startDate: '', endDate: '', leaveType: 'Sick Leave', reason: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert('Failed to submit leave request');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Apply for Leave</h1>
        <p className="text-slate-500">Submit time-off requests for manager approval.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} />
          <p className="font-medium">Leave request submitted successfully. It is now pending approval.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4">New Leave Application</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input type="date" required className="w-full p-2 border border-slate-300 rounded-lg" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input type="date" required className="w-full p-2 border border-slate-300 rounded-lg" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
            <select className="w-full p-2 border border-slate-300 rounded-lg" value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}>
              <option value="SICK">Sick Leave</option>
              <option value="VACATION">Vacation / Annual</option>
              <option value="PERSONAL">Personal Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea required className="w-full p-2 border border-slate-300 rounded-lg h-24" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
          </div>
          <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLeave;

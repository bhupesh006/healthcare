import React, { useState, useContext } from 'react';
import { FileText, CheckCircle2, Clock, Calendar, ShieldCheck, Sparkles, Send } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StaffLeave = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'SICK',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const staffIdToSend = user?.staffId?._id || user?.staffId;
      await axios.post('http://localhost:5000/api/leaves', {
        staff: staffIdToSend,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'PENDING'
      });
      setSuccess(true);
      setFormData({ startDate: '', endDate: '', leaveType: 'SICK', reason: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert('Failed to submit leave request');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Apply for Leave
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
            Time-Off Portal
          </span>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="font-bold text-xs">
            Leave request submitted successfully. It has been routed to your unit supervisor for review.
          </p>
        </div>
      )}

      {/* Main Application Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80">
        <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">New Leave Application</h3>
            <p className="text-xs text-slate-500">Provide dates and reason for department scheduling.</p>
          </div>
          <span className="text-[11px] font-bold text-[#00828e] bg-[#e6f8fa] px-3 py-1 rounded-full">
            Standard 48h SLA
          </span>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Leave Start Date
              </label>
              <input 
                type="date" 
                required 
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none transition-all" 
                value={formData.startDate} 
                onChange={e => setFormData({...formData, startDate: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Leave End Date
              </label>
              <input 
                type="date" 
                required 
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none transition-all" 
                value={formData.endDate} 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Leave Category
            </label>
            <select 
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none transition-all" 
              value={formData.leaveType} 
              onChange={e => setFormData({...formData, leaveType: e.target.value})}
            >
              <option value="SICK">Sick Leave (Medical Recovery)</option>
              <option value="VACATION">Vacation / Annual Leave</option>
              <option value="PERSONAL">Personal Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason / Medical Justification
            </label>
            <textarea 
              required 
              placeholder="Please provide details regarding this absence..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 h-28 focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none transition-all" 
              value={formData.reason} 
              onChange={e => setFormData({...formData, reason: e.target.value})}
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex items-center gap-2 bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send size={14} />
              <span>{loading ? 'Submitting Application...' : 'Submit Request for Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffLeave;

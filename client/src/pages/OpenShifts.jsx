import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Briefcase, Calendar, Clock, MapPin, Users, Plus, Building2, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const OpenShifts = () => {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'STAFF';
  
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For Create Shift Modal (Management only)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShift, setNewShift] = useState({ date: '', startTime: '08:00 AM', endTime: '04:00 PM', shiftType: 'MORNING', requiredStaff: 1, department: '' });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchOpenShifts();
  }, []);

  const fetchOpenShifts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/shifts');
      const open = res.data.filter(s => s.status === 'UNDERSTAFFED' || s.status === 'PUBLISHED');
      setShifts(open);
      
      if (!isStaff) {
        const deptRes = await axios.get('http://localhost:5000/api/departments');
        setDepartments(deptRes.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleApply = async (shiftId) => {
    try {
      const staffIdToSend = user.staffId?._id || user.staffId;
      await axios.post(`http://localhost:5000/api/shifts/${shiftId}/apply`, { staffId: staffIdToSend });
      fetchOpenShifts();
      alert('Shift request submitted successfully!');
    } catch (error) {
      console.error('Error applying for shift', error);
      alert(error.response?.data?.message || 'Error applying for shift');
    }
  };

  const handleApproveApplicant = async (shiftId, applicantId) => {
    try {
      await axios.post(`http://localhost:5000/api/shifts/${shiftId}/assign`, { staffId: applicantId });
      alert('Applicant approved and assigned successfully!');
      fetchOpenShifts();
    } catch (error) {
      console.error('Error approving applicant', error);
      alert(error.response?.data?.message || 'Error approving applicant');
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      let deptId = newShift.department;
      if (!deptId && departments.length > 0) {
        deptId = departments[0]._id;
      }
      await axios.post('http://localhost:5000/api/shifts', { ...newShift, department: deptId, status: 'UNDERSTAFFED' });
      setShowCreateModal(false);
      setNewShift({ date: '', startTime: '08:00 AM', endTime: '04:00 PM', shiftType: 'MORNING', requiredStaff: 1, department: '' });
      fetchOpenShifts();
    } catch (error) {
      console.error('Error creating open shift', error);
      alert(error.response?.data?.message || 'Error creating shift');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Open Shift Marketplace
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              {shifts.length} Available Slots
            </span>
          </div>
        </div>

        {!isStaff && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>Broadcast Open Shift</span>
          </button>
        )}
      </div>

      {/* Grid of Open Shifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <p className="text-slate-400 text-xs py-12 text-center col-span-full">Loading available shifts...</p>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 col-span-full">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No open shifts currently available.</p>
            <p className="text-xs text-slate-400 mt-1">All hospital units are fully covered.</p>
          </div>
        ) : (
          shifts.map((shift) => {
            const openCount = Math.max(0, shift.requiredStaff - (shift.assignedStaff?.length || 0));
            const isHighPriority = shift.status === 'UNDERSTAFFED';

            return (
              <div 
                key={shift._id} 
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Header Banner */}
                <div className={`p-5 border-b ${
                  isHighPriority 
                    ? 'bg-rose-50/70 border-rose-100' 
                    : 'bg-[#eef9fa] border-[#d7f1f5]'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200/70 shadow-2xs">
                      <Building2 size={12} className="text-[#00a8b5]" />
                      {shift.department?.code || 'WARD'}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      isHighPriority ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isHighPriority ? 'Urgent Cover' : 'Open Slot'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">
                    {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-[#00828e] font-bold text-xs mt-0.5">
                    {shift.shiftType} Rotation
                  </p>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-2.5 text-xs text-slate-600 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} className="text-[#00a8b5]" />
                    <span className="font-semibold text-slate-800">{shift.startTime} – {shift.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Briefcase size={14} className="text-[#00a8b5]" />
                    <span>Role: <strong className="text-slate-800 font-bold">{shift.requiredRoles?.join(', ') || 'Any Clinical Staff'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users size={14} className="text-[#00a8b5]" />
                    <span><strong className="text-rose-600 font-bold">{openCount}</strong> positions open</span>
                  </div>
                </div>

                {/* Staff Claim / Apply Action */}
                {isStaff && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {shift.applicants?.some(a => a._id === (user.staffId?._id || user.staffId)) ? (
                      <button disabled className="w-full py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs cursor-not-allowed">
                        ✓ Request Pending Approval
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(shift._id)}
                        className="w-full py-2.5 bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Claim Shift
                      </button>
                    )}
                  </div>
                )}

                {/* Management Applicants Review List */}
                {!isStaff && shift.applicants && shift.applicants.length > 0 && (
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Applicants ({shift.applicants.length})
                    </h4>
                    <div className="space-y-1.5">
                      {shift.applicants.map(applicant => (
                        <div key={applicant._id} className="flex justify-between items-center text-xs bg-white p-2.5 border border-slate-200 rounded-xl shadow-2xs">
                          <div>
                            <p className="font-bold text-slate-800">{applicant.fullName}</p>
                            <p className="text-[10px] text-slate-500">{applicant.role}</p>
                          </div>
                          <button 
                            onClick={() => handleApproveApplicant(shift._id, applicant._id)} 
                            className="text-[11px] font-bold text-white bg-[#00a8b5] hover:bg-[#00929e] px-3 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && !isStaff && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Create Open Shift</h2>
            <p className="text-xs text-slate-500 mb-5">Open slots will be visible to all qualified department nurses.</p>

            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  required 
                  value={newShift.date} 
                  onChange={e => setNewShift({...newShift, date: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Department</label>
                <select 
                  required 
                  value={newShift.department} 
                  onChange={e => setNewShift({...newShift, department: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Start Time</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="08:00 AM" 
                    value={newShift.startTime} 
                    onChange={e => setNewShift({...newShift, startTime: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">End Time</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="04:00 PM" 
                    value={newShift.endTime} 
                    onChange={e => setNewShift({...newShift, endTime: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Shift Type</label>
                  <select 
                    value={newShift.shiftType} 
                    onChange={e => setNewShift({...newShift, shiftType: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  >
                    <option value="MORNING">Morning (8 AM)</option>
                    <option value="AFTERNOON">Afternoon (4 PM)</option>
                    <option value="EVENING">Evening (6 PM)</option>
                    <option value="NIGHT">Night (10 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Required Staff</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={newShift.requiredStaff} 
                    onChange={e => setNewShift({...newShift, requiredStaff: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#00a8b5] hover:bg-[#00929e] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00a8b5]/20"
                >
                  Publish Open Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenShifts;

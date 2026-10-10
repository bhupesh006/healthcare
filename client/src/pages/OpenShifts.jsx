import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Briefcase, Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
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
      // For open shifts, we might want to ensure they are marked as UNDERSTAFFED explicitly, 
      // but creating a shift with assignedStaff = [] will naturally be understaffed if requiredStaff > 0
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Open Shift Marketplace</h1>
          <p className="text-slate-500">Available shifts that require additional coverage</p>
        </div>
        {!isStaff && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Create Open Shift</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Loading available shifts...</p>
        ) : shifts.length === 0 ? (
          <p className="text-slate-500 col-span-full">No open shifts currently available.</p>
        ) : (
          shifts.map((shift) => (
            <div key={shift._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-primary transition-colors">
              <div className={`p-4 ${shift.status === 'UNDERSTAFFED' ? 'bg-red-50 border-b border-red-100' : 'bg-slate-50 border-b border-slate-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block px-2 py-1 bg-white text-slate-700 text-xs font-bold rounded-md border border-slate-200">
                    {shift.department?.code}
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${shift.status === 'UNDERSTAFFED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {shift.status === 'UNDERSTAFFED' ? 'High Priority' : 'Available'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-primary font-semibold text-sm">{shift.shiftType}</p>
              </div>

              <div className="p-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-400" />
                  <span>{shift.startTime} - {shift.endTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-slate-400" />
                  <span>Requires: {shift.requiredRoles?.join(', ') || 'Any'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-slate-400" />
                  <span>{shift.requiredStaff - shift.assignedStaff.length} positions open</span>
                </div>
              </div>

              {isStaff && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  {shift.applicants?.some(a => a._id === (user.staffId?._id || user.staffId)) ? (
                    <button disabled className="w-full py-2 bg-green-100 text-green-700 rounded-lg font-medium shadow-sm cursor-not-allowed">
                      Request Pending Approval
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(shift._id)}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                      Request Shift
                    </button>
                  )}
                </div>
              )}

              {!isStaff && shift.applicants && shift.applicants.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Applicants ({shift.applicants.length})</h4>
                  <div className="space-y-2">
                    {shift.applicants.map(applicant => (
                      <div key={applicant._id} className="flex justify-between items-center text-sm bg-white p-2 border border-slate-200 rounded">
                        <div>
                          <p className="font-semibold text-slate-800">{applicant.fullName}</p>
                          <p className="text-xs text-slate-500">{applicant.role}</p>
                        </div>
                        <button onClick={() => handleApproveApplicant(shift._id, applicant._id)} className="text-xs font-semibold text-primary hover:underline px-3 py-1 bg-primary/10 rounded-full">Approve</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && !isStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Open Shift</h2>
            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" required value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select required value={newShift.department} onChange={e => setNewShift({...newShift, department: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input type="text" required placeholder="08:00 AM" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input type="text" required placeholder="04:00 PM" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shift Type</label>
                <select value={newShift.shiftType} onChange={e => setNewShift({...newShift, shiftType: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Required Staff</label>
                <input type="number" min="1" required value={newShift.requiredStaff} onChange={e => setNewShift({...newShift, requiredStaff: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">Create Open Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenShifts;

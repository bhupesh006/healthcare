import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, UserPlus, Users, CheckCircle, AlertCircle, Search } from 'lucide-react';

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShift, setNewShift] = useState({ date: '', startTime: '08:00 AM', endTime: '04:00 PM', shiftType: 'MORNING', requiredStaff: 1, department: '' });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/shifts');
      setShifts(res.data);
      const deptRes = await axios.get('http://localhost:5000/api/departments');
      setDepartments(deptRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shifts', error);
      setLoading(false);
    }
  };

  const handleFindStaff = async (shiftId) => {
    try {
      setSelectedShift(shiftId);
      const res = await axios.get(`http://localhost:5000/api/shifts/${shiftId}/eligible-staff`);
      setAssignmentData(res.data);
    } catch (error) {
      console.error('Error fetching eligibility', error);
    }
  };

  const handleAssignStaff = async (staffId) => {
    try {
      await axios.post(`http://localhost:5000/api/shifts/${selectedShift}/assign`, { staffId });
      fetchShifts();
      handleFindStaff(selectedShift);
    } catch (error) {
      console.error('Error assigning staff', error);
      alert(error.response?.data?.message || 'Error assigning staff');
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      let deptId = newShift.department;
      if (!deptId && departments.length > 0) {
        deptId = departments[0]._id;
      }
      await axios.post('http://localhost:5000/api/shifts', { ...newShift, department: deptId });
      setShowCreateModal(false);
      fetchShifts();
    } catch (error) {
      console.error('Error creating shift', error);
      alert(error.response?.data?.message || 'Error creating shift');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shift Management</h1>
          <p className="text-slate-500">Manage schedules and staffing coverage</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Create Shift
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shifts List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-[calc(100vh-180px)] overflow-y-auto">
          <h2 className="font-bold text-slate-900 mb-4 px-2">Upcoming Shifts</h2>
          {loading ? (
            <p className="text-slate-500 text-sm px-2">Loading...</p>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift) => (
                <div 
                  key={shift._id} 
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedShift === shift._id ? 'border-primary bg-primary-light/30' : 'border-slate-100 hover:bg-slate-50'}`}
                  onClick={() => handleFindStaff(shift._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                      {shift.department?.code} - {shift.shiftType}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${shift.status === 'UNDERSTAFFED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {shift.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900">{new Date(shift.date).toLocaleDateString()}</h3>
                  <p className="text-sm text-slate-500 mb-3">{shift.startTime} - {shift.endTime}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-600">
                      <Users size={16} className="mr-1" />
                      {shift.assignedStaff.length} / {shift.requiredStaff} Staff
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Assignment Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-[calc(100vh-180px)] overflow-y-auto">
          {!assignmentData ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <UserPlus size={48} className="mb-4 text-slate-300" />
              <p>Select a shift to find eligible staff</p>
            </div>
          ) : (
            <div>
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Smart Staff Assignment</h2>
                <p className="text-slate-500 text-sm">Evaluating availability, compliance, and working hours.</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-green-700 flex items-center gap-2 mb-3">
                  <CheckCircle size={18} /> Recommended Staff ({assignmentData.eligibleStaff.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignmentData.eligibleStaff.map(staff => (
                    <div key={staff._id} className="p-3 border border-green-200 bg-green-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{staff.fullName}</p>
                        <p className="text-xs text-slate-600">{staff.role}</p>
                      </div>
                      <button onClick={() => handleAssignStaff(staff._id)} className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded shadow-sm text-xs font-semibold hover:bg-green-100">
                        Assign
                      </button>
                    </div>
                  ))}
                  {assignmentData.eligibleStaff.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No eligible staff found.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                  <AlertCircle size={18} /> Assignment Blocked ({assignmentData.ineligibleStaff.length})
                </h3>
                <div className="space-y-3">
                  {assignmentData.ineligibleStaff.map(item => (
                    <div key={item.staff._id} className="p-3 border border-red-200 bg-red-50 rounded-lg flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{item.staff.fullName} <span className="text-xs text-slate-500 font-normal">({item.staff.role})</span></p>
                        <div className="mt-1 space-y-1">
                          {item.reasons.map((reason, idx) => (
                            <p key={idx} className="text-xs text-red-700 font-medium">• {reason}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Shift</h2>
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
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">Create Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shifts;

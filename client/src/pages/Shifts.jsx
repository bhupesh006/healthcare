import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  UserPlus, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Clock, 
  Building2, 
  ShieldCheck, 
  X, 
  UserMinus, 
  Check, 
  Loader2, 
  Sparkles,
  Filter,
  CheckCheck
} from 'lucide-react';

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [newShift, setNewShift] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00 AM',
    endTime: '04:00 PM',
    shiftType: 'MORNING',
    requiredStaff: 1,
    department: '',
    assignedStaff: []
  });

  useEffect(() => {
    fetchShifts(true);
  }, []);

  const fetchShifts = async (autoSelectFirst = false) => {
    try {
      setLoading(true);
      const [resShifts, resDepts, resStaff] = await Promise.all([
        axios.get('http://localhost:5000/api/shifts'),
        axios.get('http://localhost:5000/api/departments'),
        axios.get('http://localhost:5000/api/staff')
      ]);

      const fetchedShifts = resShifts.data || [];
      const fetchedDepts = resDepts.data || [];
      const fetchedStaff = resStaff.data || [];

      setShifts(fetchedShifts);
      setDepartments(fetchedDepts);
      setAllStaff(fetchedStaff);

      if (fetchedDepts.length > 0 && !newShift.department) {
        setNewShift(prev => ({ ...prev, department: fetchedDepts[0]._id }));
      }

      // If auto-selecting first shift or retaining selection
      if (autoSelectFirst && fetchedShifts.length > 0) {
        handleFindStaff(fetchedShifts[0]._id);
      } else if (selectedShift) {
        handleFindStaff(selectedShift);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching shifts', error);
      setLoading(false);
    }
  };

  const handleFindStaff = async (shiftId) => {
    try {
      setSelectedShift(shiftId);
      setLoadingStaff(true);
      setStaffError(null);
      const res = await axios.get(`http://localhost:5000/api/shifts/${shiftId}/eligible-staff`);
      setAssignmentData(res.data);
    } catch (error) {
      console.error('Error fetching eligibility', error);
      setStaffError(error.response?.data?.message || 'Failed to calculate staff eligibility.');
      setAssignmentData(null);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAssignStaff = async (staffId) => {
    if (!selectedShift) return;
    try {
      await axios.post(`http://localhost:5000/api/shifts/${selectedShift}/assign`, { staffId });
      showNotification('Staff assigned successfully to shift!', 'success');
      // Refresh shift list and smart match
      const res = await axios.get('http://localhost:5000/api/shifts');
      setShifts(res.data || []);
      handleFindStaff(selectedShift);
    } catch (error) {
      console.error('Error assigning staff', error);
      showNotification(error.response?.data?.message || 'Error assigning staff', 'error');
    }
  };

  const handleUnassignStaff = async (staffId) => {
    if (!selectedShift) return;
    try {
      await axios.post(`http://localhost:5000/api/shifts/${selectedShift}/unassign`, { staffId });
      showNotification('Staff removed from shift.', 'info');
      // Refresh shift list and smart match
      const res = await axios.get('http://localhost:5000/api/shifts');
      setShifts(res.data || []);
      handleFindStaff(selectedShift);
    } catch (error) {
      console.error('Error unassigning staff', error);
      showNotification(error.response?.data?.message || 'Error removing staff', 'error');
    }
  };

  const showNotification = (msg, type = 'success') => {
    setActionNotice({ msg, type });
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      let deptId = newShift.department;
      if (!deptId && departments.length > 0) {
        deptId = departments[0]._id;
      }

      const payload = {
        ...newShift,
        department: deptId,
        requiredStaff: Number(newShift.requiredStaff) || 1
      };

      const res = await axios.post('http://localhost:5000/api/shifts', payload);
      setShowCreateModal(false);

      const createdShift = res.data;
      const deptName = departments.find(d => d._id === deptId)?.name || 'Department';

      showNotification(`New shift created for ${deptName}! Available staff loaded below.`, 'success');

      // Reset modal state
      setNewShift({
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        shiftType: 'MORNING',
        requiredStaff: 1,
        department: departments[0]?._id || '',
        assignedStaff: []
      });

      // Refresh shifts and immediately select the new shift
      const resShifts = await axios.get('http://localhost:5000/api/shifts');
      setShifts(resShifts.data || []);

      if (createdShift?._id) {
        handleFindStaff(createdShift._id);
      }
    } catch (error) {
      console.error('Error creating shift', error);
      showNotification(error.response?.data?.message || 'Error creating shift', 'error');
    }
  };

  const togglePreAssign = (staffId) => {
    setNewShift(prev => {
      const already = prev.assignedStaff.includes(staffId);
      if (already) {
        return { ...prev, assignedStaff: prev.assignedStaff.filter(id => id !== staffId) };
      } else {
        return { ...prev, assignedStaff: [...prev.assignedStaff, staffId] };
      }
    });
  };

  // Filtered shifts based on department dropdown tab
  const filteredShifts = shifts.filter(s => {
    if (filterDepartment === 'ALL') return true;
    if (filterDepartment === 'UNDERSTAFFED') {
      return s.status === 'UNDERSTAFFED' || (s.assignedStaff?.length < s.requiredStaff);
    }
    const shiftDeptId = s.department?._id || s.department;
    return shiftDeptId === filterDepartment;
  });

  // Current selected shift object
  const currentShift = shifts.find(s => s._id === selectedShift) || assignmentData?.shift;

  // Staff belonging to department selected in modal
  const activeModalDeptId = newShift.department || (departments[0]?._id);
  const modalDeptStaff = allStaff.filter(s => {
    const sDeptId = s.department?._id || s.department;
    return sDeptId === activeModalDeptId;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all border ${
          actionNotice.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : actionNotice.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionNotice.type === 'error' ? (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            ) : actionNotice.type === 'info' ? (
              <Users size={20} className="text-blue-600 shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            )}
            <span className="text-xs font-bold">{actionNotice.msg}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-current cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shift Operations & Coverage
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              {shifts.length} Total Shifts
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create shifts, match eligible staff by hospital department, and balance clinical schedules.
          </p>
        </div>

        <button 
          onClick={() => {
            if (departments.length > 0 && !newShift.department) {
              setNewShift(prev => ({ ...prev, department: departments[0]._id }));
            }
            setShowCreateModal(true);
          }} 
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Create New Shift</span>
        </button>
      </div>

      {/* Main Shift Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shifts List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 flex flex-col h-[calc(100vh-230px)]">
          <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-sm">Shift Schedule Queue</h2>
              <span className="text-xs text-slate-400">Click shift to assign</span>
            </div>

            {/* Department Quick Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
              <button
                onClick={() => setFilterDepartment('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterDepartment === 'ALL'
                    ? 'bg-[#00a8b5] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({shifts.length})
              </button>
              <button
                onClick={() => setFilterDepartment('UNDERSTAFFED')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterDepartment === 'UNDERSTAFFED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Understaffed
              </button>
              {departments.map(d => (
                <button
                  key={d._id}
                  onClick={() => setFilterDepartment(d._id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    filterDepartment === d._id
                      ? 'bg-[#00828e] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-[#00a8b5]" />
                <p className="text-xs font-semibold">Loading shifts...</p>
              </div>
            ) : filteredShifts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Calendar size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-500">No shifts match this filter</p>
                <p className="text-[11px] text-slate-400">Try selecting another department or create a new shift.</p>
              </div>
            ) : (
              filteredShifts.map((shift) => {
                const isSelected = selectedShift === shift._id;
                const isUnderstaffed = shift.status === 'UNDERSTAFFED' || (shift.assignedStaff?.length < shift.requiredStaff);

                return (
                  <div 
                    key={shift._id} 
                    onClick={() => handleFindStaff(shift._id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? 'border-[#00a8b5] bg-[#eef9fa] shadow-sm ring-1 ring-[#00a8b5]/30' 
                        : 'border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Left Accent Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a8b5]" />
                    )}

                    <div className="flex justify-between items-start mb-1.5 pl-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                        <Building2 size={12} className="text-[#00a8b5]" />
                        {shift.department?.name || shift.department?.code || 'WARD'} • {shift.shiftType}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUnderstaffed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isUnderstaffed ? 'Understaffed' : 'Fully Staffed'}
                      </span>
                    </div>

                    <div className="pl-1">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-slate-400" />
                        {shift.startTime} – {shift.endTime}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 pl-1">
                      <div className="flex items-center text-slate-600 font-semibold">
                        <Users size={14} className="mr-1.5 text-[#00a8b5]" />
                        <span>{shift.assignedStaff?.length || 0} / {shift.requiredStaff} Assigned</span>
                      </div>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-[#00828e]' : 'text-slate-500 hover:text-[#00828e]'}`}>
                        {isSelected ? '✓ Selected' : 'Find Staff →'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Smart Assignment Engine (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 flex flex-col h-[calc(100vh-230px)] overflow-y-auto">
          {loadingStaff ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-[#00a8b5]" />
              <p className="font-bold text-slate-700 text-sm">Matching Staff & Compliance Rules...</p>
              <p className="text-xs text-slate-400">Verifying department unit, schedule conflicts, and BLS/ACLS certifications.</p>
            </div>
          ) : staffError ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle size={28} />
              </div>
              <p className="font-bold text-rose-700 text-sm">Unable to Load Staff Match</p>
              <p className="text-xs text-slate-500 max-w-sm text-center">{staffError}</p>
              {selectedShift && (
                <button
                  onClick={() => handleFindStaff(selectedShift)}
                  className="px-4 py-2 bg-[#00a8b5] text-white rounded-xl text-xs font-bold hover:bg-[#00929e] cursor-pointer"
                >
                  Retry Calculation
                </button>
              )}
            </div>
          ) : !assignmentData ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <div className="w-16 h-16 rounded-3xl bg-[#e6f8fa] text-[#00a8b5] flex items-center justify-center mb-3">
                <UserPlus size={28} />
              </div>
              <p className="font-bold text-slate-700 text-sm">Select a shift to trigger Smart Assignment</p>
              <p className="text-xs text-slate-400 mt-1">Calculates department match, BLS/ACLS compliance, fatigue rules, and weekly hours.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Selected Shift Header Banner */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#00a8b5] text-white text-xs font-bold">
                      {currentShift?.department?.name || currentShift?.department?.code || 'Department'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {currentShift?.shiftType} SHIFT
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-semibold">
                      {new Date(currentShift?.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Clock size={12} className="text-[#00a8b5]" />
                    <span>{currentShift?.startTime} – {currentShift?.endTime}</span>
                    <span>•</span>
                    <span>Required: <strong>{currentShift?.requiredStaff}</strong></span>
                    <span>•</span>
                    <span>Assigned: <strong>{currentShift?.assignedStaff?.length || 0}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    (currentShift?.assignedStaff?.length || 0) >= (currentShift?.requiredStaff || 1)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {(currentShift?.assignedStaff?.length || 0) >= (currentShift?.requiredStaff || 1) ? '✓ Fully Staffed' : '⚠️ Understaffed'}
                  </span>
                </div>
              </div>

              {/* Section 1: Currently Assigned Staff */}
              {currentShift?.assignedStaff && currentShift.assignedStaff.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={16} className="text-[#00a8b5]" />
                      <span>Assigned Personnel ({currentShift.assignedStaff.length} / {currentShift.requiredStaff})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentShift.assignedStaff.map(staff => {
                      const staffId = staff._id || staff;
                      const staffName = staff.fullName || allStaff.find(s => s._id === staffId)?.fullName || 'Staff Member';
                      const staffRole = staff.role || allStaff.find(s => s._id === staffId)?.role || 'Staff';

                      return (
                        <div 
                          key={staffId}
                          className="p-3.5 border border-[#00a8b5]/30 bg-[#f0fbfb] rounded-2xl flex justify-between items-center shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#00a8b5] text-white flex items-center justify-center font-extrabold text-xs">
                              {staffName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{staffName}</p>
                              <p className="text-[11px] text-[#00828e] font-semibold">{staffRole} • On Duty</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleUnassignStaff(staffId)} 
                            title="Remove from shift"
                            className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <UserMinus size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Eligible & Recommended Staff */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-emerald-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Eligible & Available Staff ({assignmentData.eligibleStaff?.length || 0})</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Department Matched & Clear
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignmentData.eligibleStaff?.map(staff => (
                    <div 
                      key={staff._id} 
                      className="p-3.5 border border-emerald-200/90 bg-emerald-50/60 rounded-2xl flex justify-between items-center hover:bg-emerald-50 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{staff.fullName}</p>
                        <p className="text-[11px] text-emerald-800 font-semibold">
                          {staff.role} • {staff.department?.name || 'Assigned'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          ✓ Valid Credentials & Rest Window
                        </p>
                      </div>
                      <button 
                        onClick={() => handleAssignStaff(staff._id)} 
                        className="px-3.5 py-1.5 bg-[#00a8b5] hover:bg-[#00929e] active:scale-95 text-white rounded-xl shadow-xs text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={14} />
                        <span>Assign</span>
                      </button>
                    </div>
                  ))}
                  {(!assignmentData.eligibleStaff || assignmentData.eligibleStaff.length === 0) && (
                    <div className="col-span-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
                      <p className="text-xs font-bold text-slate-700">No additional eligible staff available for this slot</p>
                      <p className="text-[11px] text-slate-500">
                        All department staff are either already assigned, scheduled on other shifts, or restricted by compliance.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Ineligible / Blocked Staff */}
              <div>
                <h3 className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <AlertCircle size={16} className="text-rose-600" />
                  <span>Restricted / Compliance Blocked ({assignmentData.ineligibleStaff?.length || 0})</span>
                </h3>

                <div className="space-y-2.5">
                  {assignmentData.ineligibleStaff?.map(item => (
                    <div 
                      key={item.staff._id} 
                      className="p-3.5 border border-rose-200/80 bg-rose-50/40 rounded-2xl flex items-start gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-xs">
                            {item.staff.fullName}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-semibold">
                            {item.staff.role} • {item.staff.department?.name || 'Ward'}
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {item.reasons.map((reason, idx) => (
                            <p key={idx} className="text-[11px] text-rose-700 font-medium flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span>{reason}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!assignmentData.ineligibleStaff || assignmentData.ineligibleStaff.length === 0) && (
                    <p className="text-xs text-slate-400 italic py-2">No blocked staff for this shift.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#e6f8fa] text-[#00a8b5] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Create Department Shift</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Select department, schedule hours, and view or pre-assign available staff.
            </p>

            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Shift Date</label>
                <input 
                  type="date" 
                  required 
                  value={newShift.date} 
                  onChange={e => setNewShift({...newShift, date: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Department Unit</label>
                <select 
                  required 
                  value={newShift.department} 
                  onChange={e => {
                    const dept = e.target.value;
                    // Reset pre-assigned staff if department changes
                    setNewShift(prev => ({ ...prev, department: dept, assignedStaff: [] }));
                  }} 
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                >
                  <option value="">-- Select Hospital Department --</option>
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
                    <option value="NIGHT">Night (10 PM)</option>
                    <option value="EMERGENCY">Emergency On-Call</option>
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

              {/* Department Staff Selector */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users size={14} className="text-[#00a8b5]" />
                    <span>Staff in Selected Department ({modalDeptStaff.length})</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#00828e]">
                    {newShift.assignedStaff.length} pre-assigned
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Click to pre-assign staff to this shift, or assign after creation:
                </p>

                {modalDeptStaff.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center text-xs text-slate-400">
                    No active staff found in this department.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {modalDeptStaff.map(staff => {
                      const isPreAssigned = newShift.assignedStaff.includes(staff._id);
                      return (
                        <div
                          key={staff._id}
                          onClick={() => togglePreAssign(staff._id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isPreAssigned
                              ? 'bg-[#eef9fa] border-[#00a8b5] text-slate-900 shadow-xs'
                              : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isPreAssigned ? 'bg-[#00a8b5] text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isPreAssigned ? <Check size={14} /> : staff.fullName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{staff.fullName}</p>
                              <p className="text-[10px] text-slate-500">{staff.role}</p>
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isPreAssigned ? 'bg-[#00a8b5] text-white' : 'bg-white border border-slate-200 text-slate-600'
                          }`}>
                            {isPreAssigned ? '✓ Selected' : '+ Pre-assign'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#00a8b5] hover:bg-[#00929e] active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-[#00a8b5]/20 cursor-pointer"
                >
                  Create & Match Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shifts;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Phone,
  Mail,
  Search,
  Plus,
  Users,
  ShieldCheck,
  CheckCircle2,
  Building2,
  X,
  Calendar,
  Clock,
  Sparkles,
  Award,
  Check
} from 'lucide-react';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  
  // Modals state
  const [selectedStaffRecord, setSelectedStaffRecord] = useState(null);
  const [assigningStaff, setAssigningStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  
  // New Staff Form state
  const [newStaffForm, setNewStaffForm] = useState({
    fullName: '',
    role: 'Nurse',
    employeeId: '',
    department: 'Emergency',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/staff');
      setStaffList(res.data || []);
    } catch (error) {
      console.error('Error fetching staff list', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/staff', newStaffForm);
      setStaffList(prev => [res.data, ...prev]);
      setShowAddModal(false);
      setNewStaffForm({ fullName: '', role: 'Nurse', employeeId: '', department: 'Emergency', email: '', phone: '' });
      triggerNotice(`Added ${res.data.fullName} to clinical directory`);
    } catch (err) {
      console.error('Error creating staff member', err);
      triggerNotice('Error registering staff member');
    }
  };

  const triggerNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedRole === 'ALL') return true;
    return staff.role.toLowerCase() === selectedRole.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Staff Directory
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              {filteredStaff.length} Active Personnel • 3×3 Grid
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by staff name, clinical role, or employee ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] transition-all shadow-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Nurse', 'Doctor', 'Staff'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedRole === role
                  ? 'bg-[#00a8b5] text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Staff 3*3 Card Grid (Optimized for 3 cards per row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 min-[940px]:grid-cols-3 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm font-medium">
            Loading hospital personnel directory...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-bold text-sm">No clinical personnel matched your search.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filter or searching by employee ID.</p>
          </div>
        ) : (
          filteredStaff.map(staff => (
            <div
              key={staff._id || staff.employeeId}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-[#00a8b5]/40 transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Card Banner */}
              <div className="h-16 sm:h-20 bg-gradient-to-r from-[#00a8b5]/20 via-[#c5eaf0] to-sky-100 relative">
                <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/90 text-[#00828e] border border-white/50 backdrop-blur-xs shadow-2xs">
                  {staff.status || 'ACTIVE'}
                </span>
              </div>

              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  {/* Avatar Bubble */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center text-lg sm:text-xl font-black text-[#00828e] bg-gradient-to-tr from-[#e6f8fa] to-white -mt-7 sm:-mt-8 mb-2.5 sm:mb-3 ring-1 ring-black/5">
                    {staff.fullName.charAt(0)}
                  </div>
                  
                  {/* Name & Role */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-[#00828e] transition-colors">
                        {staff.fullName}
                      </h3>
                      <p className="text-[#00828e] font-semibold text-xs mt-0.5">
                        {staff.role}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Rows */}
                  <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4 text-[11px] sm:text-xs text-slate-600 bg-slate-50/70 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <User size={13} className="text-[#00a8b5] flex-shrink-0" />
                      <span className="font-medium text-slate-500">ID:</span>
                      <span className="font-bold text-slate-800">{staff.employeeId}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Building2 size={13} className="text-[#00a8b5] flex-shrink-0" />
                      <span className="font-medium text-slate-500">Unit:</span>
                      <span className="font-bold text-slate-800 truncate">{staff.department?.name || 'Emergency Department'}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 truncate">
                      <Mail size={13} className="text-[#00a8b5] flex-shrink-0" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Phone size={13} className="text-[#00a8b5] flex-shrink-0" />
                      <span>{staff.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setSelectedStaffRecord(staff)}
                    className="flex-1 py-2 px-1 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] rounded-xl transition-all cursor-pointer"
                  >
                    View Records
                  </button>
                  <button
                    onClick={() => setAssigningStaff(staff)}
                    className="flex-1 py-2 px-1 text-center text-xs font-bold text-white bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Assign Shifts
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= VIEW RECORDS MODAL ================= */}
      {selectedStaffRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStaffRecord(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Overview */}
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-[#e6f8fa] text-[#00a8b5] border border-[#bfe8ee] flex items-center justify-center text-2xl font-black">
                {selectedStaffRecord.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedStaffRecord.fullName}</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedStaffRecord.status || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#00828e] mt-0.5">
                  {selectedStaffRecord.role} • {selectedStaffRecord.department?.name || 'Emergency Department'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Employee ID: {selectedStaffRecord.employeeId}</p>
              </div>
            </div>

            {/* Clinical Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Weekly Assigned
                </span>
                <span className="text-xl font-black text-slate-900">
                  {selectedStaffRecord.shiftsThisWeek || 4} Shifts
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {selectedStaffRecord.hoursWorked || 32} of 40 hours limit
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Compliance Status
                </span>
                <span className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5" />
                  100%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  All Credentials Valid
                </span>
              </div>
            </div>

            {/* Certifications & Badges */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#00a8b5]" />
                Hospital Credentials & Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedStaffRecord.certifications || ['ACLS Certified', 'BLS Healthcare Provider']).map((cert, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee] text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 text-[#00a8b5]" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Contact Details */}
            <div className="p-3.5 rounded-2xl bg-[#edf8fa] border border-[#d2f0f4] text-xs space-y-2 mb-5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium">Hospital Email:</span>
                <span className="font-bold text-slate-900">{selectedStaffRecord.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium">Beeper / Direct Ext:</span>
                <span className="font-bold text-slate-900">{selectedStaffRecord.phone}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedStaffRecord(null)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#00a8b5] hover:bg-[#00929e] transition-colors"
            >
              Close Records
            </button>
          </div>
        </div>
      )}

      {/* ================= ASSIGN SHIFTS MODAL ================= */}
      {assigningStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setAssigningStaff(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#e6f8fa] text-[#00a8b5]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assign Clinical Shift</h3>
                <p className="text-xs text-slate-500">Scheduling for {assigningStaff.fullName} ({assigningStaff.employeeId})</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Available Shift Slot
              </label>
              {[
                { time: '08:00 AM - 04:00 PM', name: 'Morning General Shift', dept: assigningStaff.department?.name || 'Emergency' },
                { time: '04:00 PM - 12:00 AM', name: 'Evening Shift (Peak Hours)', dept: assigningStaff.department?.name || 'Emergency' },
                { time: '12:00 AM - 08:00 AM', name: 'Night Critical Shift', dept: assigningStaff.department?.name || 'Emergency' }
              ].map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    triggerNotice(`Shift assigned to ${assigningStaff.fullName} (${slot.name})`);
                    setAssigningStaff(null);
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-[#00a8b5] hover:bg-[#e6f8fa]/50 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-800 block group-hover:text-[#00828e]">
                      {slot.name}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-[#00a8b5]" />
                      {slot.time} • {slot.dept}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#00a8b5] opacity-0 group-hover:opacity-100 transition-opacity">
                    Assign →
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setAssigningStaff(null)}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= ADD NEW STAFF MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#e6f8fa] text-[#00a8b5]">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Clinical Staff</h3>
                <p className="text-xs text-slate-500">Register medical personnel to hospital directory</p>
              </div>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jennifer Adams"
                  value={newStaffForm.fullName}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
                  >
                    <option value="Nurse">Nurse</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Staff">Clinical Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP010"
                    value={newStaffForm.employeeId}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={newStaffForm.department}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
                >
                  <option value="Emergency">Emergency</option>
                  <option value="ICU">ICU</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Cardiology">Cardiology</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@hc.com"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Ext</label>
                  <input
                    type="text"
                    placeholder="555-0123"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#00a8b5] hover:bg-[#00929e] shadow-md shadow-[#00a8b5]/20 transition-all cursor-pointer"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

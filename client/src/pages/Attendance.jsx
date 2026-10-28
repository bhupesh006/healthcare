import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Building2,
  MapPin,
  FileText,
  UserCheck,
  UserX,
  LogOut,
  Sparkles,
  X,
  Check,
  ShieldCheck,
  Timer,
  Fingerprint
} from 'lucide-react';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [actionNotice, setActionNotice] = useState(null);

  // Manual Attendance Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:00',
    clockOut: '16:00',
    status: 'PRESENT',
    location: 'Hospital Terminal Checkpoint',
    notes: 'Regular clinical shift hours verified'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedDept, activeFilter]);

  const fetchInitialData = async () => {
    try {
      const [deptRes, staffRes] = await Promise.all([
        axios.get('http://localhost:5000/api/departments'),
        axios.get('http://localhost:5000/api/staff')
      ]);
      setDepartments(deptRes.data || []);
      setStaffList(staffRes.data || []);
      if (staffRes.data?.length > 0 && !manualForm.staffId) {
        setManualForm(prev => ({ ...prev, staffId: staffRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching departments or staff', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [recRes, statRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/attendance?date=${selectedDate}&departmentId=${selectedDept}&status=${activeFilter}`),
        axios.get(`http://localhost:5000/api/attendance/stats?date=${selectedDate}`)
      ]);
      setRecords(recRes.data || []);
      setStats(statRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance', err);
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setActionNotice({ msg, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleClockOutStaff = async (attendanceId) => {
    try {
      await axios.post('http://localhost:5000/api/attendance/clock-out', { attendanceId });
      showToast('Staff member clocked out successfully.', 'info');
      fetchAttendance();
    } catch (err) {
      console.error('Clock out error', err);
      showToast(err.response?.data?.message || 'Error clocking out staff', 'error');
    }
  };

  const handleBiometricExit = async (attendanceId) => {
    try {
      await axios.post('http://localhost:5000/api/attendance/clock-out', {
        attendanceId,
        biometricVerified: true,
        biometricTerminalId: 'BIO-TERM-ER-02',
        location: 'Biometric Terminal BIO-ER-02 (Unit Exit)'
      });
      showToast('Biometric exit verified & rotation concluded successfully.', 'success');
      fetchAttendance();
    } catch (err) {
      console.error('Biometric exit error', err);
      showToast(err.response?.data?.message || 'Error executing biometric exit', 'error');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.staffId) {
      alert('Please select a staff member');
      return;
    }

    try {
      const clockInIso = `${manualForm.date}T${manualForm.clockIn}:00`;
      const clockOutIso = manualForm.clockOut ? `${manualForm.date}T${manualForm.clockOut}:00` : null;

      await axios.post('http://localhost:5000/api/attendance/manual', {
        ...manualForm,
        clockIn: clockInIso,
        clockOut: clockOutIso
      });

      setShowManualModal(false);
      showToast('Attendance record logged successfully!', 'success');
      fetchAttendance();
    } catch (err) {
      console.error('Manual attendance error', err);
      showToast(err.response?.data?.message || 'Error saving attendance record', 'error');
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return alert('No records to export');
    
    const headers = ['Staff Name', 'Employee ID', 'Role', 'Department', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Location', 'Notes'];
    const rows = records.map(r => [
      `"${r.staff?.fullName || ''}"`,
      `"${r.staff?.employeeId || ''}"`,
      `"${r.staff?.role || ''}"`,
      `"${r.staff?.department?.name || ''}"`,
      `"${new Date(r.date).toISOString().split('T')[0]}"`,
      `"${r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : 'N/A'}"`,
      `"${r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : (r.status === 'ON_DUTY' ? 'Active' : 'N/A')}"`,
      r.totalHours || '0',
      `"${r.status}"`,
      `"${r.location || ''}"`,
      `"${r.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true;
    const name = record.staff?.fullName?.toLowerCase() || '';
    const empId = record.staff?.employeeId?.toLowerCase() || '';
    const role = record.staff?.role?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || empId.includes(q) || role.includes(q);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ON_DUTY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            On Duty (Active)
          </span>
        );
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Completed
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={13} /> Late Arrival
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} /> Absent
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <FileText size={13} /> On Leave
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all border ${
          actionNotice.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : actionNotice.type === 'info'
            ? 'bg-sky-50 border-sky-200 text-sky-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionNotice.type === 'error' ? (
              <XCircle size={20} className="text-rose-600 shrink-0" />
            ) : actionNotice.type === 'info' ? (
              <Clock size={20} className="text-sky-600 shrink-0" />
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
              Staff Attendance &amp; Time Clock
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              Live Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time tracking of staff clock-ins, shift completions, active personnel, and punctuality.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-3 py-2 rounded-xl text-xs font-bold text-slate-700">
            <Calendar size={15} className="text-[#00a8b5]" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-slate-700 hover:bg-slate-50 active:scale-[0.99] text-xs font-bold transition-all cursor-pointer"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export Timesheet</span>
          </button>

          <button 
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Attendance</span>
          </button>
        </div>
      </div>

      {/* Real-time Summary Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 shadow-xs flex flex-col justify-center items-center col-span-2 lg:col-span-1 border border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Attendance Rate</p>
            <h3 className="text-3xl font-black mt-1 text-[#00a8b5]">{stats.complianceRate}%</h3>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1">Verified Shifts</span>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">On Duty Now</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{stats.onDuty} Active</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Late Arrivals</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{stats.late} Flagged</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
              <UserX size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Absent / Leave</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{stats.absent + stats.onLeave}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-2xl bg-[#e6f8fa] text-[#00828e]">
              <Timer size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Hours</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{stats.totalHoursToday} hrs</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: 'All Records' },
            { key: 'ON_DUTY', label: 'On Duty (Active)' },
            { key: 'PRESENT', label: 'Completed Shifts' },
            { key: 'LATE', label: 'Late Arrivals' },
            { key: 'ABSENT', label: 'Absent' },
            { key: 'LEAVE', label: 'On Leave' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-[#00a8b5] text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Department Filter */}
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-white border border-slate-200/90 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
            />
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7fcfd] border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="p-4 pl-6">Staff Member</th>
                <th className="p-4">Department Unit</th>
                <th className="p-4">Clock In</th>
                <th className="p-4">Clock Out</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4">Terminal / Location</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00a8b5] border-t-transparent rounded-full animate-spin" />
                      <p className="font-semibold text-xs">Loading attendance roster...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">No attendance records for {selectedDate}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Use "Log Attendance" above to record hours for this date.</p>
                  </td>
                </tr>
              ) : filteredRecords.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Staff Member */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#e6f8fa] text-[#00828e] font-extrabold text-xs flex items-center justify-center">
                        {record.staff?.fullName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{record.staff?.fullName || 'Staff'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {record.staff?.employeeId || 'EMP'} • {record.staff?.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">
                      <Building2 size={12} className="text-[#00a8b5]" />
                      {record.staff?.department?.name || record.staff?.department?.code || 'Hospital Ward'}
                    </span>
                  </td>

                  {/* Clock In */}
                  <td className="p-4 font-semibold text-slate-700">
                    {record.clockIn ? (
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(record.clockIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not clocked in</span>
                    )}
                  </td>

                  {/* Clock Out */}
                  <td className="p-4 font-semibold text-slate-700">
                    {record.clockOut ? (
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(record.clockOut).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ) : record.status === 'ON_DUTY' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        In Progress
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="p-4">
                    <span className="font-extrabold text-slate-900 text-xs">
                      {record.totalHours ? `${record.totalHours} hrs` : record.status === 'ON_DUTY' ? 'Active' : '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {getStatusBadge(record.status)}
                  </td>

                  {/* Terminal / Location */}
                  <td className="p-4 text-slate-500">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px] font-medium text-slate-700">{record.location || 'Hospital Checkpoint'}</span>
                      </div>
                      {record.biometricVerified && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
                          <Fingerprint size={11} className="text-emerald-500 shrink-0" />
                          <span>Biometric Terminal ({record.biometricTerminalId || 'BIO-ER-02'})</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 pr-6 text-right">
                    {record.status === 'ON_DUTY' ? (
                      <button
                        onClick={() => handleBiometricExit(record._id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                        title="Authorize biometric terminal clock-out"
                      >
                        <Fingerprint size={13} />
                        <span>Biometric Exit</span>
                      </button>
                    ) : record.biometricVerified ? (
                      <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={12} /> Biometric Verified
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Standard Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#e6f8fa] text-[#00a8b5] flex items-center justify-center">
                <Clock size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Log Staff Attendance</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Record or override clinical shifts hours for compliance and payroll accounting.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Clinical Personnel</label>
                <select
                  required
                  value={manualForm.staffId}
                  onChange={(e) => setManualForm({ ...manualForm, staffId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                >
                  <option value="">-- Select Staff Member --</option>
                  {staffList.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.role} - {s.department?.name || 'Ward'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Attendance Date</label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Clock In Time</label>
                  <input
                    type="time"
                    required
                    value={manualForm.clockIn}
                    onChange={(e) => setManualForm({ ...manualForm, clockIn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Clock Out Time</label>
                  <input
                    type="time"
                    value={manualForm.clockOut}
                    onChange={(e) => setManualForm({ ...manualForm, clockOut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  >
                    <option value="PRESENT">Present (Completed)</option>
                    <option value="ON_DUTY">On Duty (Currently Active)</option>
                    <option value="LATE">Late Arrival</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LEAVE">On Approved Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Terminal / Checkpoint</label>
                  <input
                    type="text"
                    value={manualForm.location}
                    onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Supervisor Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Approved shift swap relief"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a8b5] hover:bg-[#00929e] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00a8b5]/20 cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Attendance;

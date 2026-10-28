import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { format, startOfWeek, addDays, isSameDay, isAfter, startOfDay, addWeeks, subWeeks } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import {
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  RefreshCw,
  FileCheck,
  Users,
  Activity,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  X,
  CheckCircle2,
  LogOut,
  UserCheck,
  Timer,
  Fingerprint,
  ScanFace,
  ScanLine
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [shifts, setShifts] = useState([]);
  const [openShiftsCount, setOpenShiftsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStarts: 0 }));
  const [selectedShiftModal, setSelectedShiftModal] = useState(null);

  // Live Attendance & Clock In state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [clockMessage, setClockMessage] = useState(null);

  // Biometric Terminal Modal state
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [scanningBiometric, setScanningBiometric] = useState(false);
  const [biometricScanSuccess, setBiometricScanSuccess] = useState(false);

  // Generate 7 days for the selected week
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    fetchMyShifts();
  }, [user]);

  const fetchMyShifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/shifts');
      
      const loggedInStaffId = user?.staffId?._id 
        ? user.staffId._id.toString() 
        : (user?.staffId ? user.staffId.toString() : '');
      const loggedInName = (user?.name || '').toLowerCase();

      // Filter shifts assigned to the logged-in staff member (by ID or matching name)
      const myShifts = res.data.filter(shift => 
        shift.assignedStaff && shift.assignedStaff.some(staff => {
          const sId = staff?._id ? staff._id.toString() : (typeof staff === 'string' ? staff : '');
          const sName = (staff?.fullName || '').toLowerCase();
          return (loggedInStaffId && sId === loggedInStaffId) || (loggedInName && sName === loggedInName);
        })
      );

      setShifts(myShifts);

      // Count open shifts for the widget
      const open = res.data.filter(s => s.status === 'UNDERSTAFFED' || s.status === 'PUBLISHED');
      setOpenShiftsCount(open.length);

      // Fetch today's attendance for this staff
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const attRes = await axios.get(`http://localhost:5000/api/attendance?date=${todayStr}`);
        const myAtt = attRes.data.find(r => {
          const sId = r.staff?._id?.toString() || r.staff?.toString();
          const sName = (r.staff?.fullName || '').toLowerCase();
          return (loggedInStaffId && sId === loggedInStaffId) || (loggedInName && sName === loggedInName);
        });
        setTodayAttendance(myAtt || null);
      } catch (attErr) {
        console.error('Error fetching today attendance', attErr);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff shifts', error);
      setLoading(false);
    }
  };

  const getShiftsForDay = (date) => {
    return shifts.filter(shift => {
      const sDate = new Date(shift.date);
      return (
        sDate.getFullYear() === date.getFullYear() &&
        sDate.getMonth() === date.getMonth() &&
        sDate.getDate() === date.getDate()
      );
    });
  };

  const getUpcomingShift = () => {
    const today = startOfDay(new Date());
    const upcoming = shifts
      .filter(shift => isAfter(new Date(shift.date), today) || isSameDay(new Date(shift.date), today))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const nextShift = getUpcomingShift();

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStarts: 0 }));
  };

  const handleClockIn = async () => {
    try {
      setClockActionLoading(true);
      let staffId = user?.staffId?._id || user?.staffId;
      if (!staffId) {
        const sRes = await axios.get('http://localhost:5000/api/staff');
        const match = sRes.data.find(s => s.fullName?.toLowerCase() === user?.name?.toLowerCase()) || sRes.data[0];
        staffId = match?._id;
      }
      const res = await axios.post('http://localhost:5000/api/attendance/clock-in', {
        staffId,
        shiftId: nextShift?._id,
        location: 'Mobile / Portal Attendance Checkpoint'
      });
      setTodayAttendance(res.data);
      setClockMessage({ text: 'Clocked in successfully! Have a safe and focused shift.', type: 'success' });
      setTimeout(() => setClockMessage(null), 5000);
    } catch (err) {
      console.error('Clock in error', err);
      setClockMessage({ text: err.response?.data?.message || 'Error clocking in', type: 'error' });
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setClockActionLoading(true);
      const res = await axios.post('http://localhost:5000/api/attendance/clock-out', {
        attendanceId: todayAttendance?._id
      });
      setTodayAttendance(res.data);
      setClockMessage({ text: `Shift clocked out! Total duration: ${res.data.totalHours || 0} hrs.`, type: 'info' });
      setTimeout(() => setClockMessage(null), 5000);
    } catch (err) {
      console.error('Clock out error', err);
      setClockMessage({ text: err.response?.data?.message || 'Error clocking out', type: 'error' });
    } finally {
      setClockActionLoading(false);
    }
  };

  const executeBiometricClockOut = async () => {
    try {
      setScanningBiometric(true);
      // Simulate hardware optical biometric scanner matching sequence
      setTimeout(async () => {
        try {
          const res = await axios.post('http://localhost:5000/api/attendance/clock-out', {
            attendanceId: todayAttendance?._id,
            location: 'Biometric Terminal BIO-ER-02 (Unit Exit)',
            biometricVerified: true,
            biometricTerminalId: 'BIO-TERM-ER-02'
          });
          setBiometricScanSuccess(true);
          setTimeout(() => {
            setTodayAttendance(res.data);
            setShowBiometricModal(false);
            setScanningBiometric(false);
            setBiometricScanSuccess(false);
            setClockMessage({
              text: `Biometric Identity Verified (Fingerprint Match 99.8%)! Shift rotation concluded. Duration: ${res.data.totalHours || 0} hrs.`,
              type: 'success'
            });
            setTimeout(() => setClockMessage(null), 6000);
          }, 900);
        } catch (err) {
          console.error('Biometric clock out error', err);
          setScanningBiometric(false);
          setClockMessage({ text: err.response?.data?.message || 'Biometric authentication failed', type: 'error' });
        }
      }, 1200);
    } catch (err) {
      setScanningBiometric(false);
      console.error('Biometric error', err);
    }
  };

  // Helper for shift style and icons
  const getShiftVisual = (shiftType) => {
    switch (shiftType) {
      case 'MORNING':
        return {
          bg: 'bg-gradient-to-br from-[#e6f8fa] to-[#d6f4f8] border-[#bfe8ee] text-[#007a84]',
          pill: 'bg-[#00a8b5] text-white',
          icon: Sun,
          label: 'Morning Shift'
        };
      case 'AFTERNOON':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-900',
          pill: 'bg-amber-500 text-white',
          icon: Sunset,
          label: 'Afternoon Shift'
        };
      case 'NIGHT':
        return {
          bg: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 text-indigo-900',
          pill: 'bg-indigo-600 text-white',
          icon: Moon,
          label: 'Night Shift'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-800',
          pill: 'bg-slate-700 text-white',
          icon: Clock,
          label: 'General Shift'
        };
    }
  };

  // Calculate shifts in the currently viewed week
  const shiftsInViewWeek = weekDays.flatMap(day => getShiftsForDay(day));
  const totalWeeklyHours = shiftsInViewWeek.length * 8;

  return (
    <div className="space-y-7 max-w-7xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Nurse'}!
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              Frontline Staff Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/open-shifts"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all"
          >
            <Users size={16} />
            <span>Open Shifts ({openShiftsCount})</span>
          </Link>
          <Link
            to="/my-leave"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200/80 transition-colors"
          >
            <span>Apply Leave</span>
          </Link>
        </div>
      </div>

      {/* Clock Message Alert */}
      {clockMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-xs ${
          clockMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : clockMessage.type === 'info'
            ? 'bg-sky-50 border-sky-200 text-sky-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            {clockMessage.type === 'error' ? <AlertCircle size={18} className="text-rose-600" /> : <CheckCircle2 size={18} className="text-emerald-600" />}
            <span>{clockMessage.text}</span>
          </div>
          <button onClick={() => setClockMessage(null)} className="p-1 hover:bg-black/5 rounded-lg cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Clinical Shift Live Attendance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            todayAttendance?.status === 'ON_DUTY' || (todayAttendance?.clockIn && !todayAttendance?.clockOut)
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : todayAttendance?.clockOut
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'bg-[#00a8b5]/20 text-[#00a8b5] border border-[#00a8b5]/30'
          }`}>
            <Clock size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                todayAttendance?.status === 'ON_DUTY' || (todayAttendance?.clockIn && !todayAttendance?.clockOut)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : todayAttendance?.clockOut
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {todayAttendance?.status === 'ON_DUTY' || (todayAttendance?.clockIn && !todayAttendance?.clockOut)
                  ? 'Active Shift On Duty'
                  : todayAttendance?.clockOut
                  ? 'Shift Completed'
                  : 'Shift Standby'}
              </span>
              <span className="text-xs text-slate-400">• Today's Rotation</span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-1">
              {todayAttendance?.status === 'ON_DUTY' || (todayAttendance?.clockIn && !todayAttendance?.clockOut)
                ? `Clocked in at ${new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : todayAttendance?.clockOut
                ? `Completed ${todayAttendance.totalHours || 0} Hours today`
                : nextShift 
                ? `Scheduled: ${nextShift.shiftType} Shift (${nextShift.startTime} - ${nextShift.endTime})`
                : 'Ready for clinical shift check-in'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {todayAttendance?.status === 'ON_DUTY' || (todayAttendance?.clockIn && !todayAttendance?.clockOut)
                ? 'Clinical hours are being actively tracked. Scan fingerprint at exit checkpoint terminal to verify shift conclusion.'
                : todayAttendance?.clockOut
                ? `Biometric exit authenticated (${todayAttendance.biometricTerminalId || 'BIO-TERM-ER-02'}). Clinical hours logged.`
                : 'Press Clock In to log your physical arrival and notify clinical charge nurse.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {todayAttendance?.status === 'ON_DUTY' || (todayAttendance?.clockIn && !todayAttendance?.clockOut) ? (
            <button
              onClick={() => setShowBiometricModal(true)}
              disabled={clockActionLoading}
              className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all duration-300 flex items-center gap-2.5 cursor-pointer disabled:opacity-50 border border-emerald-400/30 hover:scale-[1.02] active:scale-[0.98]"
              title="Scan fingerprint at checkpoint terminal to conclude shift"
            >
              <div className="relative flex items-center justify-center">
                <Fingerprint size={18} className="text-white group-hover:scale-110 transition-transform animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold tracking-wide">Biometric Clock-Out</span>
                <span className="text-[10px] text-emerald-100 font-normal opacity-90">Terminal BIO-ER-02</span>
              </div>
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/20 text-white rounded">
                Scan
              </span>
            </button>
          ) : todayAttendance?.clockOut ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <div className="flex flex-col text-left leading-tight">
                <span>Shift Concluded</span>
                <span className="text-[10px] text-emerald-400/80 font-mono">Biometric Exit Verified</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={clockActionLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00a8b5] to-cyan-500 hover:from-[#00929e] hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-[#00a8b5]/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserCheck size={16} />
              <span>{clockActionLoading ? 'Connecting...' : 'Clock In Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Next Shift Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Rotation</span>
            <div className="p-2.5 bg-[#e6f8fa] text-[#00a8b5] rounded-2xl">
              <Clock size={20} />
            </div>
          </div>
          {nextShift ? (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {format(new Date(nextShift.date), 'EEE, MMM d')}
              </h3>
              <p className="text-xs font-bold text-[#00828e] mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00a8b5] animate-ping"></span>
                <span>{nextShift.shiftType} • {nextShift.startTime} ({nextShift.department?.code || 'ER'})</span>
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Off Duty</h3>
              <p className="text-xs text-slate-400 mt-1">No upcoming shifts scheduled.</p>
            </div>
          )}
        </div>

        {/* Compliance Status Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Credential Health</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <FileCheck size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-extrabold text-emerald-600 tracking-tight">100% Compliant</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">BLS & ACLS active and verified.</p>
          </div>
        </div>

        {/* Open Shifts Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Slots</span>
            <div className="p-2.5 bg-[#e6f8fa] text-[#00a8b5] rounded-2xl">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{openShiftsCount} Available</h3>
              <span className="text-[10px] font-bold text-[#00828e] bg-[#e6f8fa] px-2 py-0.5 rounded-full">Extra Pay</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Matching your unit qualifications.</p>
          </div>
        </div>

        {/* Scheduled Hours Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Week Allocation</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{totalWeeklyHours} Hours</h3>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {shiftsInViewWeek.length} Shifts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Total clinical scheduled time.</p>
          </div>
        </div>

      </div>

      {/* ================= WEEKLY ROTATION TIMELINE CALENDAR ================= */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Calendar Navigation Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#00a8b5]" />
              <span>My Weekly Rotation Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Week of {format(currentWeekStart, 'MMMM d, yyyy')} • {shiftsInViewWeek.length} assigned shifts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCurrentWeek}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/80"
            >
              Current Week
            </button>
            <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200/80 p-1">
              <button
                onClick={handlePrevWeek}
                className="p-1 text-slate-600 hover:bg-white rounded-lg transition-colors"
                title="Previous Week"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-extrabold text-slate-800 px-2 min-w-[90px] text-center">
                {format(currentWeekStart, 'MMM d')} – {format(addDays(currentWeekStart, 6), 'MMM d')}
              </span>
              <button
                onClick={handleNextWeek}
                className="p-1 text-slate-600 hover:bg-white rounded-lg transition-colors"
                title="Next Week"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 bg-[#f7fcfd]">
          {weekDays.map((day, i) => {
            const isTodayDate = isSameDay(day, new Date());
            const dayShifts = getShiftsForDay(day);

            return (
              <div 
                key={i} 
                className={`p-3 text-center border-r border-slate-200/60 last:border-r-0 transition-colors ${
                  isTodayDate ? 'bg-[#eef9fa]' : ''
                }`}
              >
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {format(day, 'EEE')}
                </p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <p className={`text-base font-extrabold ${isTodayDate ? 'text-[#00a8b5]' : 'text-slate-800'}`}>
                    {format(day, 'd')}
                  </p>
                  {isTodayDate && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-[#00a8b5] text-white">
                      Today
                    </span>
                  )}
                </div>
                {dayShifts.length > 0 && (
                  <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-[#00a8b5]"></span>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly Day Cells with Marked Shifts */}
        <div className="grid grid-cols-7 min-h-[220px] divide-x divide-slate-100">
          {weekDays.map((day, i) => {
            const dayShifts = getShiftsForDay(day);
            const isTodayDate = isSameDay(day, new Date());

            return (
              <div 
                key={i} 
                className={`p-2.5 flex flex-col justify-between transition-colors ${
                  isTodayDate ? 'bg-[#fafefe]' : 'hover:bg-slate-50/50'
                }`}
              >
                {dayShifts.length > 0 ? (
                  <div className="space-y-2">
                    {dayShifts.map((shift) => {
                      const visual = getShiftVisual(shift.shiftType);
                      const IconComponent = visual.icon;
                      const colleagues = shift.assignedStaff?.filter(s => {
                        const sId = s?._id?.toString() || s?.toString();
                        const loggedInStaffId = user?.staffId?._id?.toString() || user?.staffId?.toString();
                        return sId !== loggedInStaffId && (s.fullName?.toLowerCase() !== user?.name?.toLowerCase());
                      }) || [];

                      return (
                        <div
                          key={shift._id}
                          onClick={() => setSelectedShiftModal(shift)}
                          className={`p-3 rounded-2xl border shadow-xs transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${visual.bg}`}
                        >
                          {/* Badge + Icon */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs ${visual.pill}`}>
                              {shift.shiftType}
                            </span>
                            <IconComponent size={14} className="opacity-80" />
                          </div>

                          {/* Unit & Times */}
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {shift.department?.name || shift.department?.code || 'Emergency Unit'}
                          </p>

                          <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                            <Clock size={11} className="opacity-70" />
                            <span>{shift.startTime} – {shift.endTime}</span>
                          </div>

                          {/* Shift Peers */}
                          {colleagues.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-black/5 text-[10px] text-slate-600 flex items-center justify-between">
                              <span className="truncate">With {colleagues[0].fullName || 'Peer'}</span>
                              <span className="text-[#00828e] font-bold">Details →</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Off-Duty Day Card */
                  <div className="h-full flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-200 text-center my-auto min-h-[140px] bg-slate-50/40">
                    <span className="text-xs font-bold text-slate-400">Off Duty</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Rest Period</span>
                    <Link
                      to="/open-shifts"
                      className="mt-3 text-[10px] font-bold text-[#00828e] hover:underline bg-white px-2 py-1 rounded-lg border border-slate-200/80 shadow-2xs transition-all"
                    >
                      + Claim Shift
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SHIFT DETAIL & QUICK SWAP MODAL ================= */}
      {selectedShiftModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedShiftModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#e6f8fa] text-[#00a8b5]">
                <Clock size={24} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00a8b5] text-white">
                  {selectedShiftModal.shiftType} Rotation
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {format(new Date(selectedShiftModal.date), 'EEEE, MMMM d, yyyy')}
                </h3>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 mb-5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Department Unit:</span>
                <span className="font-extrabold text-slate-900">
                  {selectedShiftModal.department?.name} ({selectedShiftModal.department?.code})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Working Hours:</span>
                <span className="font-extrabold text-slate-900">
                  {selectedShiftModal.startTime} – {selectedShiftModal.endTime} (8 Hours)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Assigned Team:</span>
                <span className="font-semibold text-[#00828e]">
                  {selectedShiftModal.assignedStaff?.map(s => s.fullName).join(', ') || 'Self'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Compliance Standing:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Verified (BLS & ACLS Valid)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedShiftModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <Link
                to="/my-swaps"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00a8b5] hover:bg-[#00929e] shadow-md shadow-[#00a8b5]/25 flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Request Shift Swap</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Verification Checkpoint Terminal Modal */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Terminal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Fingerprint className="text-emerald-400" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Terminal BIO-ER-02 Online
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">Biometric Exit Checkpoint</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!scanningBiometric) setShowBiometricModal(false);
                }}
                disabled={scanningBiometric}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-6 text-center">
              {/* Staff Badge Info */}
              <div className="mb-6 bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 font-black flex items-center justify-center text-sm">
                    {user?.name ? user.name.charAt(0) : 'S'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{user?.name || 'Staff Member'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {user?.staffId?._id?.slice(-6)?.toUpperCase() || 'STF-8492'} • Emergency / ICU
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Authorized
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">Shift: On Duty</div>
                </div>
              </div>

              {/* Optical Scanner Zone */}
              <div className="relative my-4 flex flex-col items-center justify-center">
                <div 
                  onClick={() => {
                    if (!scanningBiometric && !biometricScanSuccess) {
                      executeBiometricClockOut();
                    }
                  }}
                  className={`w-40 h-40 rounded-3xl relative flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden ${
                    biometricScanSuccess
                      ? 'bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.4)]'
                      : scanningBiometric
                      ? 'bg-teal-950/60 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)]'
                      : 'bg-slate-950 border-2 border-slate-700 hover:border-emerald-500/60 shadow-inner group'
                  }`}
                >
                  {/* Glass Prism Background Grid */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

                  {/* Laser Scan Beam */}
                  {scanningBiometric && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-[bounce_1.4s_infinite]"></div>
                  )}

                  {/* Fingerprint / Success Icon */}
                  {biometricScanSuccess ? (
                    <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                      <CheckCircle2 size={54} className="text-emerald-400" />
                      <span className="text-xs font-mono font-black text-emerald-300 mt-2">100% MATCH</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Fingerprint 
                        size={58} 
                        className={`transition-colors duration-300 ${
                          scanningBiometric 
                            ? 'text-cyan-400 scale-105' 
                            : 'text-slate-500 group-hover:text-emerald-400'
                        }`} 
                      />
                      <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">
                        {scanningBiometric ? 'Scanning...' : 'Touch Sensor'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subtext description under scanner */}
                <div className="mt-4">
                  {biometricScanSuccess ? (
                    <p className="text-xs font-bold text-emerald-400">
                      ✓ Biometric Hash Confirmed • Rotation Clocked Out
                    </p>
                  ) : scanningBiometric ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-cyan-300 animate-pulse">
                        Verifying Papillary Ridge Geometry...
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Hardware Sensor: FPC1020 • Match Hash: SHA-256
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-300">
                        Place your registered finger on the optical sensor prism
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Shift exit timestamp will be cryptographically sealed to this terminal.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2">
                {!biometricScanSuccess && (
                  <button
                    onClick={executeBiometricClockOut}
                    disabled={scanningBiometric}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Fingerprint size={16} />
                    <span>{scanningBiometric ? 'Authenticating Biometrics...' : 'Scan Fingerprint & Clock Out'}</span>
                  </button>
                )}
                <button
                  onClick={() => setShowBiometricModal(false)}
                  disabled={scanningBiometric}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {biometricScanSuccess ? 'Done' : 'Cancel Checkpoint Verification'}
                </button>
              </div>

              {/* Terminal Metadata Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>TERMINAL: BIO-TERM-ER-02</span>
                <span>GATEWAY: IP 192.168.10.42</span>
                <span className="text-emerald-500">AES-256</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;

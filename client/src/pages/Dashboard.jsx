import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import {
  Users,
  AlertCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [swapsList, setSwapsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [
        shiftsRes,
        deptRes,
        staffRes,
        attRes,
        complianceRes,
        leavesRes,
        swapsRes
      ] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/shifts'),
        axios.get('http://localhost:5000/api/departments'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/attendance'),
        axios.get('http://localhost:5000/api/compliance'),
        axios.get('http://localhost:5000/api/leaves'),
        axios.get('http://localhost:5000/api/swaps')
      ]);

      if (shiftsRes.status === 'fulfilled' && shiftsRes.data) {
        setShifts(shiftsRes.data);
      }
      if (deptRes.status === 'fulfilled' && deptRes.data) {
        setDepartments(deptRes.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.data) {
        setStaffList(staffRes.data);
      }
      if (attRes.status === 'fulfilled' && attRes.data) {
        setAttendanceList(attRes.data);
      }
      if (complianceRes.status === 'fulfilled' && complianceRes.data) {
        setComplianceRecords(complianceRes.data);
      }
      if (leavesRes.status === 'fulfilled' && leavesRes.data) {
        setLeavesList(leavesRes.data);
      }
      if (swapsRes.status === 'fulfilled' && swapsRes.data) {
        setSwapsList(swapsRes.data);
      }
    } catch (err) {
      console.warn('Error loading live dashboard telemetry', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ================= 1. DYNAMIC GRAPH: SHIFT COVERAGE BY DEPARTMENT =================
  const departmentChartData = useMemo(() => {
    // Determine active departments list
    const activeDepts = departments.length > 0
      ? departments
      : [
          { _id: '1', name: 'Emergency', code: 'ER' },
          { _id: '2', name: 'Intensive Care Unit', code: 'ICU' },
          { _id: '3', name: 'General Ward', code: 'GEN' }
        ];

    const data = activeDepts.map(dept => {
      // Find all shifts scheduled for this department
      const deptShifts = shifts.filter(s => {
        const sDeptId = s.department?._id?.toString() || s.department?.toString();
        const sDeptName = s.department?.name || '';
        return (dept._id && sDeptId === dept._id.toString()) ||
               (dept.name && sDeptName.toLowerCase() === dept.name.toLowerCase());
      });

      // Sum required and assigned staff dynamically
      const required = deptShifts.reduce((acc, s) => {
        const req = s.requiredStaffCount !== undefined && s.requiredStaffCount !== null
          ? Number(s.requiredStaffCount)
          : Math.max(1, s.assignedStaff?.length || 1);
        return acc + req;
      }, 0);

      const assigned = deptShifts.reduce((acc, s) => {
        return acc + (s.assignedStaff?.length || 0);
      }, 0);

      const understaffed = Math.max(0, required - assigned);
      const isCritical = (
        dept.code === 'ER' ||
        dept.code === 'ICU' ||
        dept.name.toLowerCase().includes('emerg') ||
        dept.name.toLowerCase().includes('icu')
      );

      return {
        dept: dept.code || dept.name,
        fullName: dept.name,
        required,
        assigned,
        understaffed,
        isCritical
      };
    });

    if (selectedDept === 'CRITICAL') {
      return data.filter(d => d.isCritical);
    }
    return data;
  }, [departments, shifts, selectedDept]);

  // ================= 2. DYNAMIC GRAPH: WEEKLY CLINICAL HOURS & CAPACITY =================
  const weeklyHoursChartData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStarts: 1 });
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return dayLabels.map((dayLabel, index) => {
      const targetDate = addDays(weekStart, index);

      // Match shifts on this day
      const dayShifts = shifts.filter(s => {
        if (!s.date) return false;
        return isSameDay(new Date(s.date), targetDate);
      });

      // Planned hours: 8 hours per required staff slot
      const planned = dayShifts.reduce((acc, s) => {
        const slots = s.requiredStaffCount !== undefined && s.requiredStaffCount !== null
          ? Number(s.requiredStaffCount)
          : Math.max(1, s.assignedStaff?.length || 1);
        return acc + (slots * 8);
      }, 0);

      // Actual logged hours from attendance records on this day
      const dayAttendance = attendanceList.filter(a => {
        if (!a.clockIn) return false;
        return isSameDay(new Date(a.clockIn), targetDate);
      });

      const actual = dayAttendance.reduce((acc, a) => {
        return acc + (Number(a.totalHours) || 8);
      }, 0);

      return {
        day: dayLabel,
        planned,
        actual
      };
    });
  }, [shifts, attendanceList]);

  // Total weekly planned capacity hours
  const totalWeeklyHours = useMemo(() => {
    const total = weeklyHoursChartData.reduce((acc, d) => acc + (d.planned || d.actual), 0);
    return total > 0 ? total : shifts.length * 8;
  }, [weeklyHoursChartData, shifts]);

  // ================= 3. DYNAMIC GRAPH: STAFF BY DEPARTMENT UNIT (DONUT) =================
  const departmentDistributionData = useMemo(() => {
    if (staffList.length === 0) {
      return [];
    }

    const palette = ['#00a8b5', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const deptMap = {};

    staffList.forEach(s => {
      const dName = s.department?.name || 'General Clinical';
      deptMap[dName] = (deptMap[dName] || 0) + 1;
    });

    return Object.entries(deptMap).map(([name, count], idx) => ({
      name,
      count,
      value: Math.round((count / staffList.length) * 100),
      color: palette[idx % palette.length]
    }));
  }, [staffList]);

  // ================= 4. DYNAMIC TOP KPI METRICS =================
  const metrics = useMemo(() => {
    // 1. Staff on duty
    const totalStaff = staffList.length;
    const activeDutyRecords = attendanceList.filter(a =>
      a.status === 'ON_DUTY' || (a.clockIn && !a.clockOut)
    );
    const onDutyCount = activeDutyRecords.length;

    // 2. Shift Coverage
    const totalShifts = shifts.length;
    const understaffedCount = shifts.filter(s => {
      const req = s.requiredStaffCount !== undefined && s.requiredStaffCount !== null
        ? Number(s.requiredStaffCount)
        : 1;
      return s.status === 'UNDERSTAFFED' || (s.assignedStaff?.length || 0) < req;
    }).length;

    const fullyStaffedCount = Math.max(0, totalShifts - understaffedCount);
    const coverageRate = totalShifts > 0
      ? Math.round((fullyStaffedCount / totalShifts) * 100)
      : 100;

    // 3. Compliance Rate
    const totalCompliance = complianceRecords.length;
    const validCount = complianceRecords.filter(c => c.status === 'VALID').length;
    const expiringSoonCount = complianceRecords.filter(c => c.status === 'EXPIRING_SOON').length;
    const complianceRate = totalCompliance > 0
      ? Math.round((validCount / totalCompliance) * 100)
      : 100;

    // 4. Action Queue
    const pendingLeaves = leavesList.filter(l => l.status === 'PENDING').length;
    const pendingSwaps = swapsList.filter(s => s.status === 'PENDING').length;
    const totalPending = pendingLeaves + pendingSwaps;

    return {
      totalStaff,
      onDutyCount,
      totalShifts,
      fullyStaffedCount,
      understaffedCount,
      coverageRate,
      complianceRate,
      expiringSoonCount,
      totalPending,
      pendingLeaves,
      pendingSwaps
    };
  }, [staffList, attendanceList, shifts, complianceRecords, leavesList, swapsList]);

  // Today's Active Shifts
  const todayShifts = useMemo(() => {
    const today = new Date();
    return shifts.filter(s => s.date && isSameDay(new Date(s.date), today));
  }, [shifts]);

  // Active on-duty personnel
  const activePersonnel = useMemo(() => {
    return attendanceList.filter(a => a.status === 'ON_DUTY' || (a.clockIn && !a.clockOut));
  }, [attendanceList]);

  // Urgent compliance warnings
  const complianceWarnings = useMemo(() => {
    return complianceRecords.filter(c => c.status === 'EXPIRING_SOON' || c.status === 'EXPIRED').slice(0, 3);
  }, [complianceRecords]);

  // Calendar numbers around today
  const calendarDays = useMemo(() => {
    const today = new Date();
    const todayNum = today.getDate();
    return Array.from({ length: 14 }).map((_, i) => {
      const dNum = todayNum - 3 + i;
      const dDate = new Date(today.getFullYear(), today.getMonth(), dNum);
      const hasShifts = shifts.some(s => s.date && isSameDay(new Date(s.date), dDate));
      return {
        day: dDate.getDate(),
        isToday: isSameDay(dDate, today),
        hasShifts
      };
    });
  }, [shifts]);

  return (
    <div className="space-y-7 max-w-7xl mx-auto select-none">
      
      {/* ================= 1. DASHBOARD HEADER & QUICK ACTIONS ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinical Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time hospital telemetries, shift coverage analytics, and staffing distribution
          </p>
        </div>

        {/* Quick Actions & Live Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/80 transition-colors cursor-pointer"
            title="Refresh Live Telemetries"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-[#00a8b5]' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <Link
            to="/shifts"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Shift</span>
          </Link>

          <Link
            to="/compliance"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold border border-slate-200/80 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#00a8b5]" />
            <span>Compliance Audit</span>
          </Link>

          <Link
            to="/calendar"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/60 transition-colors"
            title="Open Calendar"
          >
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Calendar</span>
          </Link>
        </div>
      </div>

      {/* ================= 2. TOP METRIC CARDS (4 KPI TILES DYNAMIC) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Clinical Staff */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Staff</span>
            <div className="p-2.5 rounded-2xl bg-[#e6f8fa] text-[#00a8b5] group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.totalStaff}</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span><strong>{metrics.onDutyCount} on duty</strong> right now across units</span>
          </p>
        </div>

        {/* Shift Fill Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shift Coverage</span>
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.coverageRate}%</span>
            {metrics.understaffedCount > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {metrics.understaffedCount} Alert{metrics.understaffedCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Optimal
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            <strong>{metrics.fullyStaffedCount} of {metrics.totalShifts} shifts</strong> fully staffed
          </p>
        </div>

        {/* Compliance Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance Index</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{metrics.complianceRate}%</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Audit Verified
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            {metrics.expiringSoonCount > 0 
              ? `${metrics.expiringSoonCount} renewals due soon` 
              : 'All staff certifications verified'}
          </p>
        </div>

        {/* Pending Leave & Swaps */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Action Queue</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.totalPending}</span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              metrics.totalPending > 0 ? 'text-purple-700 bg-purple-100/60' : 'text-slate-500 bg-slate-100'
            }`}>
              {metrics.totalPending > 0 ? 'Requires Review' : 'Queue Clear'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            <strong>{metrics.pendingLeaves} leaves</strong> & <strong>{metrics.pendingSwaps} swap requests</strong>
          </p>
        </div>
      </div>

      {/* ================= 3. MAIN DASHBOARD SPLIT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* ================= LEFT 8-COLUMNS: CHARTS & OPERATIONAL DATA ================= */}
        <div className="lg:col-span-8 space-y-7">
          
          {/* Chart 1: Department Shift Coverage Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Shift Coverage by Department</h3>
                <p className="text-xs text-slate-500 mt-0.5">Required vs Assigned nurses from scheduled shifts</p>
              </div>

              {/* Department Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedDept('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedDept === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All Wards
                </button>
                <button
                  onClick={() => setSelectedDept('CRITICAL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedDept === 'CRITICAL' ? 'bg-white text-[#00828e] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ER & ICU
                </button>
              </div>
            </div>

            {/* Recharts Bar Graph (100% Dynamic from shifts) */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dept" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(0, 168, 181, 0.05)' }}
                  />
                  <Bar dataKey="required" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Required Nurses" barSize={18} />
                  <Bar dataKey="assigned" fill="#00a8b5" radius={[6, 6, 0, 0]} name="Assigned Nurses" barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 text-xs text-slate-500 border-t border-slate-50">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#cbd5e1]"></span> Required Baseline
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#00a8b5]"></span> Assigned Staff
              </span>
            </div>
          </div>

          {/* Chart 2: Weekly Clinical Staff Hours (Smooth Area Chart from shifts & attendance) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekly Clinical Hours & Capacity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Planned vs actual operational hours across units</p>
              </div>
              <span className="text-xs font-bold text-[#00828e] bg-[#e6f8fa] px-3 py-1 rounded-full">
                {totalWeeklyHours} Total Hours
              </span>
            </div>

            <div className="h-56 sm:h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyHoursChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a8b5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00a8b5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#00a8b5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                    name="Actual Logged Hours"
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                    name="Target Hours"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Operations Row: Role Breakdown & Urgent Compliance Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Role Breakdown Donut (100% Dynamic from staff list) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Staff by Department Unit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Active workforce distribution ({staffList.length} total staff)</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {departmentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, item) => [`${item?.payload?.count || 0} Staff (${val}%)`, name]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {departmentDistributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 font-medium truncate">{item.name}</span>
                    <span className="font-bold text-slate-800 ml-auto">{item.count} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Action Items (Dynamic from complianceRecords) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Compliance Warnings</h3>
                  <Link to="/compliance" className="text-xs font-bold text-[#00828e] hover:underline">
                    View All
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Certifications requiring validation</p>
              </div>

              <div className="space-y-3 my-3">
                {complianceWarnings.length === 0 ? (
                  <div className="p-4 text-center text-emerald-700 text-xs font-medium bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    All staff certifications currently up to date!
                  </div>
                ) : (
                  complianceWarnings.map(c => (
                    <div key={c._id} className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-amber-900 truncate">
                            {c.staff?.fullName || 'Staff Member'} ({c.staff?.department?.name || 'Clinical Unit'})
                          </p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                            {c.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {c.certificationName} renewal required.
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/compliance"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Run Compliance Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= RIGHT 4-COLUMNS: SCHEDULE & TIMELINE ================= */}
        <div className="lg:col-span-4 space-y-7">
          
          {/* Mini Calendar Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">{format(new Date(), 'MMMM yyyy')}</h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Numbers */}
            <div className="grid grid-cols-7 gap-1 text-xs text-center font-medium">
              {calendarDays.map((item, idx) => (
                <div
                  key={idx}
                  className={`h-8 flex flex-col items-center justify-center rounded-xl transition-all ${
                    item.isToday
                      ? 'bg-[#00a8b5] text-white font-extrabold shadow-sm'
                      : item.hasShifts
                      ? 'bg-[#f0fafb] text-[#00828e] font-bold hover:bg-[#e6f8fa]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.day}</span>
                  {item.hasShifts && !item.isToday && (
                    <span className="w-1 h-1 rounded-full bg-[#00a8b5]"></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today's Shifts & Timeline (Dynamic from shifts list) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Shifts</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {format(new Date(), 'EEEE, d MMM')} • {todayShifts.length} Rotations
                </p>
              </div>
              <Link to="/shifts" className="text-xs font-bold text-[#00828e] hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3.5">
              {todayShifts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">No shifts scheduled for today</p>
                  <Link to="/shifts" className="text-[11px] text-[#00a8b5] font-bold mt-1 inline-block hover:underline">
                    + Schedule New Shift
                  </Link>
                </div>
              ) : (
                todayShifts.slice(0, 4).map(shift => {
                  const assignedCount = shift.assignedStaff?.length || 0;
                  const reqCount = shift.requiredStaffCount !== undefined && shift.requiredStaffCount !== null
                    ? Number(shift.requiredStaffCount)
                    : Math.max(1, assignedCount);
                  const isUnderstaffed = assignedCount < reqCount;

                  return (
                    <div
                      key={shift._id}
                      className={`p-3.5 rounded-2xl border transition-colors ${
                        isUnderstaffed
                          ? 'bg-rose-50/70 border-rose-200/80'
                          : 'bg-slate-50/80 border-slate-200/70 hover:border-[#00a8b5]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold ${isUnderstaffed ? 'text-rose-950' : 'text-slate-900'}`}>
                          {shift.department?.name || 'Clinical Unit'} - {shift.shiftType}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isUnderstaffed ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {assignedCount}/{reqCount} {isUnderstaffed ? 'Understaffed' : 'Staffed'}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs mb-2 ${isUnderstaffed ? 'text-rose-700' : 'text-slate-500'}`}>
                        <Clock className={`w-3.5 h-3.5 ${isUnderstaffed ? 'text-rose-500' : 'text-slate-400'}`} />
                        <span>{shift.startTime} – {shift.endTime}</span>
                      </div>
                      <div className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                        isUnderstaffed ? 'border-rose-200/60' : 'border-slate-200/50 text-slate-600'
                      }`}>
                        <span className="truncate max-w-[190px]">
                          {shift.assignedStaff?.map(s => s.fullName).join(', ') || 'No staff assigned'}
                        </span>
                        {isUnderstaffed ? (
                          <Link
                            to="/shifts"
                            className="text-[10px] font-bold text-rose-700 hover:underline bg-white px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs"
                          >
                            + Assign
                          </Link>
                        ) : (
                          <span className="font-semibold text-emerald-700">Scheduled</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* On Duty Personnel (Dynamic from Attendance) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">On Duty Personnel</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activePersonnel.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {activePersonnel.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-slate-100">
                  No personnel currently clocked in
                </div>
              ) : (
                activePersonnel.slice(0, 4).map(att => (
                  <div key={att._id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                        {att.staff?.fullName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{att.staff?.fullName || 'Staff Member'}</p>
                        <p className="text-[10px] text-slate-500">
                          {att.staff?.department?.name || 'Clinical Unit'} • On Duty
                        </p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;

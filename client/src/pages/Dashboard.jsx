import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Users,
  AlertCircle,
  Clock,
  ShieldCheck,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  RefreshCw,
  Building2,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Activity,
  MoreVertical,
  Stethoscope,
  Filter
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

// Department Staffing Bar Chart Data
const initialDepartmentData = [
  { dept: 'ER Trauma', required: 12, assigned: 12, understaffed: 0 },
  { dept: 'ICU Ward', required: 10, assigned: 9, understaffed: 1 },
  { dept: 'Pediatrics', required: 8, assigned: 8, understaffed: 0 },
  { dept: 'Cardiology', required: 6, assigned: 6, understaffed: 0 },
  { dept: 'General Ward', required: 14, assigned: 13, understaffed: 1 },
  { dept: 'Surgery / OT', required: 7, assigned: 7, understaffed: 0 },
];

// Weekly Clinical Hours Area Chart Data
const weeklyHoursData = [
  { day: 'Mon', planned: 240, actual: 235 },
  { day: 'Tue', planned: 260, actual: 268 },
  { day: 'Wed', planned: 250, actual: 248 },
  { day: 'Thu', planned: 270, actual: 285 },
  { day: 'Fri', planned: 280, actual: 278 },
  { day: 'Sat', planned: 230, actual: 226 },
  { day: 'Sun', planned: 220, actual: 215 },
];

// Role Distribution Donut Data
const roleDistributionData = [
  { name: 'ICU Nurses', value: 38, color: '#00a8b5' },
  { name: 'ER Staff', value: 34, color: '#0284c7' },
  { name: 'General Ward', value: 28, color: '#10b981' },
  { name: 'Float Pool', value: 16, color: '#f59e0b' },
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [shifts, setShifts] = useState([]);
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [shiftsRes, complianceRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/shifts'),
        axios.get('http://localhost:5000/api/compliance'),
      ]);

      if (shiftsRes.status === 'fulfilled' && shiftsRes.data) {
        setShifts(shiftsRes.data);
      }
      if (complianceRes.status === 'fulfilled' && complianceRes.data) {
        setComplianceRecords(complianceRes.data);
      }
    } catch (err) {
      console.warn('Using standard clinical mock data', err);
    } finally {
      setLoading(false);
    }
  };

  // Days for the Mini-Calendar
  const calendarDays = [
    { day: 14, inMonth: true },
    { day: 15, inMonth: true },
    { day: 16, inMonth: true },
    { day: 17, inMonth: true },
    { day: 18, inMonth: true, isToday: true, hasShifts: true },
    { day: 19, inMonth: true, hasShifts: true },
    { day: 20, inMonth: true, hasShifts: true },
    { day: 21, inMonth: true },
    { day: 22, inMonth: true, hasShifts: true },
    { day: 23, inMonth: true },
    { day: 24, inMonth: true },
    { day: 25, inMonth: true },
    { day: 26, inMonth: true },
    { day: 27, inMonth: true },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto select-none">
      
      {/* ================= 1. DASHBOARD HEADER & QUICK ACTIONS ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Operations Dashboard
            </h1>
          </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
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

      {/* ================= 2. TOP METRIC CARDS (4 KPI TILES) ================= */}
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
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">124</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +2.8%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span><strong>38 on duty</strong> right now across 3 units</span>
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
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">96.4%</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              1 Alert
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            <strong>14 of 15 shifts</strong> fully staffed today
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
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">98.2%</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              BLS/ACLS Valid
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            2 renewals due in under 15 days
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
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">8</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
              Requires Review
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            <strong>5 leaves</strong> & <strong>3 swap requests</strong> pending
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
                <p className="text-xs text-slate-500 mt-0.5">Required vs Assigned nurses for today</p>
              </div>

              {/* Department Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedDept('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedDept === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All Wards
                </button>
                <button
                  onClick={() => setSelectedDept('CRITICAL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedDept === 'CRITICAL' ? 'bg-white text-[#00828e] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ER & ICU
                </button>
              </div>
            </div>

            {/* Recharts Bar Graph */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={initialDepartmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dept" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 16]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(0, 168, 181, 0.05)' }}
                  />
                  <Bar dataKey="required" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Required Nurses" barSize={16} />
                  <Bar dataKey="assigned" fill="#00a8b5" radius={[6, 6, 0, 0]} name="Assigned Nurses" barSize={16} />
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

          {/* Chart 2: Weekly Clinical Staff Hours (Smooth Area Chart) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekly Clinical Hours & Capacity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Planned vs actual operational hours across units</p>
              </div>
              <span className="text-xs font-bold text-[#00828e] bg-[#e6f8fa] px-3 py-1 rounded-full">
                1,720 Total Hours
              </span>
            </div>

            <div className="h-56 sm:h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a8b5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00a8b5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[180, 300]} />
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
            
            {/* Role Breakdown Donut */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Staff by Department Unit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Active workforce distribution</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {roleDistributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 font-medium truncate">{item.name}</span>
                    <span className="font-bold text-slate-800 ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Action Items */}
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
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-amber-900">Nurse Priya (ICU)</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">12 Days</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">ACLS Certification expiring soon.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-rose-900">Dr. Kumar (Surgery)</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">Pending</span>
                    </div>
                    <p className="text-[11px] text-rose-800 mt-0.5">Missing Medical Registration renewal document.</p>
                  </div>
                </div>
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

        {/* ================= RIGHT 4-COLUMNS: SCHEDULE & TIMELINE (Inspired by Reference) ================= */}
        <div className="lg:col-span-4 space-y-7">
          
          {/* Mini Calendar Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">October 2026</h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
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

          {/* Today's Critical Shifts & Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Shifts</h3>
                <p className="text-xs text-slate-500 font-medium">Sunday, 18 Oct • 3 Rotations</p>
              </div>
              <Link to="/shifts" className="text-xs font-bold text-[#00828e] hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3.5">
              
              {/* Shift 1: Morning Shift */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-[#00a8b5]/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Emergency Unit - Morning</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    5/5 Staffed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>08:00 AM – 04:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200/50">
                  <span className="truncate">Dr. Sarah, Nurse Arun, Nurse Divya</span>
                  <span className="font-semibold text-emerald-700">Active</span>
                </div>
              </div>

              {/* Shift 2: Evening Shift */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-[#00a8b5]/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Intensive Care (ICU) - Evening</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    4/4 Staffed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>04:00 PM – 12:00 AM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200/50">
                  <span className="truncate">Nurse Meena, Nurse Priya</span>
                  <span className="font-semibold text-slate-500">Upcoming</span>
                </div>
              </div>

              {/* Shift 3: Night Shift (Understaffed!) */}
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-rose-950">Emergency Unit - Night</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                    3/4 Understaffed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-rose-700 mb-2">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>10:00 PM – 06:00 AM</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-rose-200/60">
                  <span className="text-[11px] text-rose-800 font-medium">1 open slot needs cover</span>
                  <Link
                    to="/open-shifts"
                    className="text-[11px] font-bold text-rose-700 hover:underline bg-white px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs"
                  >
                    + Assign Staff
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Frontline Staff on Duty Right Now */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">On Duty Personnel</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Status
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Nurse Arun</p>
                    <p className="text-[10px] text-slate-500">Emergency • Shift Ends 4 PM</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                    D
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Nurse Divya</p>
                    <p className="text-[10px] text-slate-500">Emergency • Shift Ends 4 PM</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dr. Sarah</p>
                    <p className="text-[10px] text-slate-500">Charge Physician • On Call</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Filter, Plus, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('ALL');

  useEffect(() => {
    fetchShifts();
  }, [currentMonth]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/shifts');
      setShifts(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shifts', error);
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Generate calendar grid days
  const start = startOfWeek(startOfMonth(currentMonth), { weekStarts: 0 }); // Sunday start
  const end = endOfWeek(endOfMonth(currentMonth), { weekStarts: 0 });
  const days = eachDayOfInterval({ start, end });

  const getShiftsForDay = (day) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      const matchesDay = shiftDate.getDate() === day.getDate() &&
             shiftDate.getMonth() === day.getMonth() &&
             shiftDate.getFullYear() === day.getFullYear();
      if (!matchesDay) return false;
      if (filterDept !== 'ALL') {
        return shift.department?.code === filterDept;
      }
      return true;
    });
  };

  const getShiftBadgeStyle = (type) => {
    switch (type) {
      case 'MORNING':
        return 'bg-[#e6f8fa] text-[#00828e] border-[#bfe8ee] hover:bg-[#d5f3f7]';
      case 'AFTERNOON':
        return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
      case 'NIGHT':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100';
      case 'EMERGENCY':
        return 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Calendar
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              Monthly Grid
            </span>
          </div>
        </div>

        {/* Controls & Nav */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={goToToday}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/80"
          >
            Today
          </button>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-2xs"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-extrabold text-slate-800 min-w-[130px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-2xs"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <Link
            to="/shifts"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all"
          >
            <Plus size={16} />
            <span>Schedule Shift</span>
          </Link>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-6 py-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-500">
          <Filter size={14} className="text-[#00a8b5]" />
          <span>Department:</span>
          <div className="flex items-center gap-1">
            {['ALL', 'ER', 'ICU', 'GW'].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filterDept === dept
                    ? 'bg-[#00a8b5] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept === 'ALL' ? 'All Units' : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Shift Type Badges Legend */}
        <div className="flex items-center gap-4 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00a8b5]"></span> Morning (8 AM)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Afternoon (4 PM)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Night (10 PM)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Understaffed Alert
          </span>
        </div>
      </div>

      {/* Main Calendar Grid Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 bg-[#f7fcfd]">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-600">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 auto-rows-[minmax(130px,auto)]">
          {days.map((day, idx) => {
            const dayShifts = getShiftsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[130px] p-2 sm:p-2.5 border-r border-b border-slate-100 transition-colors ${
                  !isCurrentMonth ? 'bg-slate-50/40 text-slate-400' : 'bg-white text-slate-800'
                } ${idx % 7 === 6 ? 'border-r-0' : ''} hover:bg-slate-50/70`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
                    isTodayDate
                      ? 'bg-[#00a8b5] text-white shadow-sm ring-2 ring-[#00a8b5]/20 font-extrabold'
                      : (isCurrentMonth ? 'text-slate-800' : 'text-slate-400')
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayShifts.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayShifts.length} {dayShifts.length === 1 ? 'shift' : 'shifts'}
                    </span>
                  )}
                </div>
                
                {/* Day Shift Pills */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-[110px] pr-0.5">
                  {dayShifts.map(shift => {
                    const isUnderstaffed = shift.status === 'UNDERSTAFFED' || shift.assignedStaff?.length < shift.requiredStaff;
                    return (
                      <div 
                        key={shift._id} 
                        className={`text-xs p-1.5 rounded-xl border transition-all truncate cursor-pointer ${getShiftBadgeStyle(shift.shiftType)}`}
                        title={`${shift.department?.name || shift.department?.code} - ${shift.shiftType} (${shift.assignedStaff?.length || 0}/${shift.requiredStaff} Staff)`}
                      >
                        <div className="font-bold flex justify-between items-center text-[11px] leading-tight">
                          <span>{shift.department?.code || 'WARD'}</span>
                          {isUnderstaffed && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Understaffed" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] mt-0.5 opacity-90">
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} />
                            {shift.startTime}
                          </span>
                          <span className="font-semibold">
                            {shift.assignedStaff?.length || 0}/{shift.requiredStaff}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

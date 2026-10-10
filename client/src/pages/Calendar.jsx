import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Generate calendar grid days
  const start = startOfWeek(startOfMonth(currentMonth), { weekStarts: 0 }); // Sunday start
  const end = endOfWeek(endOfMonth(currentMonth), { weekStarts: 0 });
  const days = eachDayOfInterval({ start, end });

  const getShiftsForDay = (day) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getDate() === day.getDate() &&
             shiftDate.getMonth() === day.getMonth() &&
             shiftDate.getFullYear() === day.getFullYear();
    });
  };

  const getShiftColor = (type) => {
    switch (type) {
      case 'MORNING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'AFTERNOON': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'NIGHT': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'EMERGENCY': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roster Calendar</h1>
          <p className="text-slate-500">Monthly overview of all department shifts</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-bold text-slate-800 min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
          {days.map((day, idx) => {
            const dayShifts = getShiftsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[120px] p-2 border-r border-b border-slate-100 ${
                  !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDate ? 'bg-primary text-white' : (isCurrentMonth ? 'text-slate-700' : 'text-slate-400')
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1.5 mt-1 overflow-y-auto max-h-[100px] pr-1 custom-scrollbar">
                  {dayShifts.map(shift => (
                    <div 
                      key={shift._id} 
                      className={`text-xs p-1.5 rounded border shadow-sm truncate ${getShiftColor(shift.shiftType)}`}
                      title={`${shift.department?.code} - ${shift.shiftType} (${shift.assignedStaff.length}/${shift.requiredStaff})`}
                    >
                      <div className="font-semibold flex justify-between items-center">
                        <span>{shift.department?.code}</span>
                        {shift.status === 'UNDERSTAFFED' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 opacity-90 text-[10px]">
                        <Clock size={10} />
                        {shift.startTime}
                      </div>
                    </div>
                  ))}
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

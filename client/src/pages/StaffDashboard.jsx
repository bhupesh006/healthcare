import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { format, startOfWeek, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { Clock, MapPin, Calendar as CalendarIcon, RefreshCw, FileCheck, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [shifts, setShifts] = useState([]);
  const [openShiftsCount, setOpenShiftsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Generate current week dates
  const startDate = startOfWeek(new Date(), { weekStarts: 0 }); // Sunday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  useEffect(() => {
    fetchMyShifts();
  }, []);

  const fetchMyShifts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/shifts');
      
      // Filter only shifts assigned to the logged-in staff member
      const myShifts = res.data.filter(shift => 
        shift.assignedStaff.some(staff => staff._id === user.staffId || staff === user.staffId)
      );
      setShifts(myShifts);

      // Count open shifts for the widget
      const open = res.data.filter(s => s.status === 'UNDERSTAFFED' || s.status === 'PUBLISHED');
      setOpenShiftsCount(open.length);
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getShiftForDay = (date) => {
    return shifts.find(shift => isSameDay(new Date(shift.date), date));
  };

  const getUpcomingShift = () => {
    const today = startOfDay(new Date());
    const upcoming = shifts
      .filter(shift => isAfter(new Date(shift.date), today) || isSameDay(new Date(shift.date), today))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const nextShift = getUpcomingShift();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-slate-500">Here is a quick overview of your current status and schedule.</p>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Next Shift Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={24} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Next Shift</span>
          </div>
          {nextShift ? (
            <div>
              <h3 className="text-xl font-bold text-slate-900">{format(new Date(nextShift.date), 'MMM d, yyyy')}</h3>
              <p className="text-sm font-medium text-blue-600 mt-1">{nextShift.shiftType} ({nextShift.startTime})</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-slate-900">None Scheduled</h3>
              <p className="text-sm text-slate-500 mt-1">You are currently off duty.</p>
            </div>
          )}
        </div>

        {/* Compliance Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <FileCheck size={24} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Status</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">100% Compliant</h3>
            <p className="text-sm text-slate-500 mt-1">All certifications are up to date.</p>
          </div>
        </div>

        {/* Open Shifts Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
            <Link to="/open-shifts" className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
              View Marketplace
            </Link>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{openShiftsCount} Available</h3>
            <p className="text-sm text-slate-500 mt-1">Extra shifts matching your role.</p>
          </div>
        </div>

        {/* Recent Activity / Hours Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Activity size={24} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">This Week</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{shifts.length * 8} Hours</h3>
            <p className="text-sm text-slate-500 mt-1">Scheduled across {shifts.length} shifts.</p>
          </div>
        </div>

      </div>

      <div className="pt-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CalendarIcon size={20} className="text-primary" />
          My Schedule
        </h2>
      </div>

      {/* Google Calendar Style Weekly View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDays.map((day, i) => (
            <div key={i} className="p-3 text-center border-r border-slate-200 last:border-r-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{format(day, 'EEE')}</p>
              <p className={`text-lg font-bold mt-1 ${isSameDay(day, new Date()) ? 'text-primary' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 min-h-[250px] divide-x divide-slate-100">
          {weekDays.map((day, i) => {
            const shift = getShiftForDay(day);
            return (
              <div key={i} className={`p-2 ${isSameDay(day, new Date()) ? 'bg-primary-light/10' : 'bg-white'}`}>
                {loading ? (
                  <div className="animate-pulse bg-slate-100 h-20 rounded"></div>
                ) : shift ? (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm group hover:shadow-md transition-shadow relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {shift.shiftType}
                      </span>
                    </div>
                    <div className="space-y-2 mt-2">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-500"/>
                        {shift.startTime} - {shift.endTime}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400"/>
                        {shift.department?.name || shift.department?.code}
                      </p>
                    </div>
                    

                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-300 text-sm italic py-8">
                    Off Duty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

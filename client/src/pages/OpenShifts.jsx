import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Calendar, Clock, MapPin, Users } from 'lucide-react';

const OpenShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestedShifts, setRequestedShifts] = useState([]);

  useEffect(() => {
    fetchOpenShifts();
  }, []);

  const fetchOpenShifts = async () => {
    try {
      // In a real app we'd have a dedicated open shifts endpoint, 
      // but for MVP we fetch understaffed shifts
      const res = await axios.get('http://localhost:5000/api/shifts');
      const open = res.data.filter(s => s.status === 'UNDERSTAFFED' || s.status === 'PUBLISHED');
      setShifts(open);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Open Shift Marketplace</h1>
          <p className="text-slate-500">Available shifts that require additional coverage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Loading available shifts...</p>
        ) : shifts.length === 0 ? (
          <p className="text-slate-500 col-span-full">No open shifts currently available.</p>
        ) : (
          shifts.map((shift) => (
            <div key={shift._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-primary transition-colors">
              <div className={`p-4 ${shift.status === 'UNDERSTAFFED' ? 'bg-red-50 border-b border-red-100' : 'bg-slate-50 border-b border-slate-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block px-2 py-1 bg-white text-slate-700 text-xs font-bold rounded-md border border-slate-200">
                    {shift.department?.code}
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${shift.status === 'UNDERSTAFFED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {shift.status === 'UNDERSTAFFED' ? 'High Priority' : 'Available'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-primary font-semibold text-sm">{shift.shiftType}</p>
              </div>

              <div className="p-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-400" />
                  <span>{shift.startTime} - {shift.endTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-slate-400" />
                  <span>Requires: {shift.requiredRoles?.join(', ') || 'Any'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-slate-400" />
                  <span>{shift.requiredStaff - shift.assignedStaff.length} positions open</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                {requestedShifts.includes(shift._id) ? (
                  <button disabled className="w-full py-2 bg-green-100 text-green-700 rounded-lg font-medium shadow-sm cursor-not-allowed">
                    Request Pending Approval
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setRequestedShifts([...requestedShifts, shift._id]);
                      alert('Shift request submitted successfully. Awaiting manager approval.');
                    }}
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Request Shift
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OpenShifts;

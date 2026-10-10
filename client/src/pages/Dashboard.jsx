import React from 'react';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
      <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome to CareRoster Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Staff" value="124" icon={Users} colorClass="bg-blue-500 text-blue-600" />
        <StatCard title="Understaffed Shifts" value="3" icon={AlertCircle} colorClass="bg-red-500 text-red-600" />
        <StatCard title="Compliance Rate" value="92%" icon={CheckCircle} colorClass="bg-green-500 text-green-600" />
        <StatCard title="Pending Leave" value="5" icon={Clock} colorClass="bg-amber-500 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Shifts (Today)</h2>
          <div className="space-y-4">
            {/* Placeholder for shifts */}
            <div className="p-4 border border-slate-100 rounded-lg flex justify-between items-center bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">Emergency Dept - Night</p>
                <p className="text-sm text-slate-500">10:00 PM - 6:00 AM</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Fully Staffed</span>
                <p className="text-sm text-slate-600 mt-1">5/5 Nurses</p>
              </div>
            </div>
            
            <div className="p-4 border border-red-100 rounded-lg flex justify-between items-center bg-red-50">
              <div>
                <p className="font-medium text-slate-900">ICU - Night</p>
                <p className="text-sm text-slate-500">10:00 PM - 6:00 AM</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Understaffed</span>
                <p className="text-sm text-slate-600 mt-1">3/4 Nurses</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Compliance Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <AlertCircle className="text-amber-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-slate-900">ACLS Expiring Soon</p>
                <p className="text-xs text-slate-600 mt-1">Nurse Priya's ACLS certification expires in 12 days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="text-red-500 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-slate-900">Missing Document</p>
                <p className="text-xs text-slate-600 mt-1">Dr. Kumar has not uploaded the updated Medical License.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

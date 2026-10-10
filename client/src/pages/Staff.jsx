import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, Mail, MapPin, Search, Filter } from 'lucide-react';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      setStaffList(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff data', error);
      setLoading(false);
    }
  };

  const filteredStaff = staffList.filter(staff => 
    staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Directory</h1>
          <p className="text-slate-500">Manage employee profiles and contact information</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">
          Add New Staff
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, role, or ID..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Loading staff profiles...</p>
        ) : filteredStaff.length === 0 ? (
          <p className="text-slate-500 col-span-full">No staff members found matching your search.</p>
        ) : (
          filteredStaff.map(staff => (
            <div key={staff._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-24 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-slate-400 bg-slate-100 -mt-10 mb-4">
                  {staff.fullName.charAt(0)}
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{staff.fullName}</h3>
                    <p className="text-primary font-medium text-sm">{staff.role}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    staff.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {staff.status}
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-400" />
                    <span>ID: {staff.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-slate-400" />
                    <span>Dept: {staff.department?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400" />
                    <span>{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400" />
                    <span>{staff.phone}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 py-2 text-sm font-medium text-primary bg-primary-light/50 hover:bg-primary-light rounded-lg transition-colors">
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Staff;

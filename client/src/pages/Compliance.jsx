import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertTriangle, ShieldAlert, FileSearch, CheckCircle, XCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
    <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
      <Icon className={colorClass.replace('bg-', 'text-')} size={20} />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium">{title}</p>
      <h3 className="text-lg font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

const Compliance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/compliance'),
        axios.get('http://localhost:5000/api/compliance/stats')
      ]);
      setRecords(recordsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching compliance data', error);
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/compliance/${id}/verify`, {
        verificationStatus: status,
        rejectionReason: status === 'REJECTED' ? 'Document unreadable' : null
      });
      fetchData(); // refresh data
    } catch (error) {
      console.error('Error verifying record', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VALID': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Valid</span>;
      case 'EXPIRED': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1"><ShieldAlert size={12}/> Expired</span>;
      case 'EXPIRING_SOON': return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1"><AlertTriangle size={12}/> Expiring Soon</span>;
      case 'PENDING_VERIFICATION': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Pending Verification</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance & Certifications</h1>
          <p className="text-slate-500">Monitor staff qualifications and document verification</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Upload Certificate
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
            <p className="text-slate-400 text-xs font-medium">Compliance Rate</p>
            <h3 className="text-3xl font-bold mt-1 text-primary-light">{stats.complianceRate}%</h3>
          </div>
          <StatCard title="Total Valid" value={stats.valid} icon={ShieldCheck} colorClass="bg-green-500 text-green-600" />
          <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertTriangle} colorClass="bg-amber-500 text-amber-600" />
          <StatCard title="Expired" value={stats.expired} icon={ShieldAlert} colorClass="bg-red-500 text-red-600" />
          <StatCard title="Pending Verify" value={stats.pendingVerification} icon={FileSearch} colorClass="bg-blue-500 text-blue-600" />
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Staff Member</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Requirement</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Expiry Date</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Verification</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">Loading compliance records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">No records found.</td></tr>
              ) : records.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{record.staff?.fullName}</p>
                    <p className="text-xs text-slate-500">{record.staff?.role} • {record.staff?.department?.code}</p>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-700">{record.requirement}</td>
                  <td className="p-4 text-sm text-slate-700">
                    {new Date(record.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="p-4 text-sm">
                    {record.verificationStatus === 'VERIFIED' ? (
                      <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={14}/> Verified</span>
                    ) : record.verificationStatus === 'REJECTED' ? (
                      <span className="text-red-600 font-medium flex items-center gap-1"><XCircle size={14}/> Rejected</span>
                    ) : (
                      <span className="text-blue-600 font-medium">Pending Review</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {record.verificationStatus === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleVerify(record._id, 'VERIFIED')}
                          className="px-2 py-1 text-xs border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 rounded transition-colors"
                        >
                          Verify
                        </button>
                        <button 
                          onClick={() => handleVerify(record._id, 'REJECTED')}
                          className="px-2 py-1 text-xs border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Compliance;

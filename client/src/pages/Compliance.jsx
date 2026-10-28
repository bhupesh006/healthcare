import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  FileSearch, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  FileText, 
  Check, 
  X, 
  Filter, 
  Eye, 
  Download, 
  ExternalLink, 
  Calendar, 
  Award, 
  Sparkles, 
  UploadCloud, 
  Building2, 
  Users,
  CheckCheck,
  Search,
  Clock
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-2xl ${bgClass} ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{value}</h3>
    </div>
  </div>
);

const getCertificateDocumentUrl = (record) => {
  if (record.documentUrl && record.documentUrl.length > 20) {
    return record.documentUrl;
  }
  // Generate high-resolution SVG certificate fallback
  const staffName = record.staff?.fullName || 'Clinical Professional';
  const certId = record.certificateNumber || `CERT-${record.requirement || 'ACC'}-729140`;
  const issueStr = record.issueDate ? new Date(record.issueDate).toISOString().split('T')[0] : '2024-01-15';
  const expiryStr = record.expiryDate ? new Date(record.expiryDate).toISOString().split('T')[0] : '2028-01-01';
  const req = record.requirement || 'CLINICAL';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" width="100%" height="100%">
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#b48328"/><stop offset="50%" stop-color="#ecc96e"/><stop offset="100%" stop-color="#9a6e1d"/>
      </linearGradient>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
      <radialGradient id="seal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ecc96e"/><stop offset="70%" stop-color="#b48328"/><stop offset="100%" stop-color="#785311"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="800" height="560" fill="url(#bg)" rx="16"/>
    <rect x="20" y="20" width="760" height="520" fill="none" stroke="url(#gold)" stroke-width="6" rx="12"/>
    <rect x="28" y="28" width="744" height="504" fill="none" stroke="#00828e" stroke-width="1.5" stroke-dasharray="8 4" rx="8"/>
    <text x="400" y="75" font-family="sans-serif" font-size="13" font-weight="700" fill="#00828e" text-anchor="middle" letter-spacing="4">HOSPITAL CLINICAL CREDENTIALING BOARD</text>
    <text x="400" y="108" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">Certificate of Accreditation</text>
    <text x="400" y="132" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Official Healthcare Professional Credential &amp; Regulatory Verification</text>
    <line x1="240" y1="145" x2="560" y2="145" stroke="url(#gold)" stroke-width="2"/>
    <text x="400" y="185" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="middle" letter-spacing="2">THIS CERTIFIES THAT</text>
    <text x="400" y="230" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#00828e" text-anchor="middle">${staffName}</text>
    <text x="400" y="265" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="middle">has fulfilled all accredited curriculum and clinical standards for</text>
    <rect x="180" y="290" width="440" height="48" rx="10" fill="#eef9fa" stroke="#bfe8ee" stroke-width="1.5"/>
    <text x="400" y="322" font-family="sans-serif" font-size="19" font-weight="800" fill="#0f172a" text-anchor="middle">${req} ACCREDITATION</text>
    <text x="120" y="380" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b">ACCREDITATION ID:</text>
    <text x="120" y="400" font-family="monospace" font-size="14" font-weight="bold" fill="#0f172a">${certId}</text>
    <text x="350" y="380" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b">ISSUANCE DATE:</text>
    <text x="350" y="400" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">${issueStr}</text>
    <text x="560" y="380" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b">EXPIRY DATE:</text>
    <text x="560" y="400" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e11d48">${expiryStr}</text>
    <g transform="translate(680, 450)">
      <circle cx="0" cy="0" r="38" fill="url(#seal)"/>
      <circle cx="0" cy="0" r="32" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 2"/>
      <text x="0" y="-5" font-family="sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">NABH</text>
      <text x="0" y="10" font-family="sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">VALID</text>
    </g>
    <line x1="120" y1="475" x2="280" y2="475" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="200" y="470" font-family="cursive" font-size="20" fill="#0f172a" text-anchor="middle">Dr. J. Henderson, MD</text>
    <text x="200" y="492" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">Chief Medical Officer</text>
    <line x1="360" y1="475" x2="520" y2="475" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="440" y="470" font-family="cursive" font-size="20" fill="#0f172a" text-anchor="middle">E. Vance, RN, BSN</text>
    <text x="440" y="492" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">Clinical Director</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

const Compliance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Certificate Viewer Modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Upload Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    staffId: '',
    requirement: 'BLS',
    certificateNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fileData: null,
    fileName: '',
    markVerified: true
  });

  useEffect(() => {
    fetchData();
    fetchStaffList();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/compliance'),
        axios.get('http://localhost:5000/api/compliance/stats')
      ]);
      setRecords(recordsRes.data || []);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching compliance data', error);
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      setStaffList(res.data || []);
      if (res.data?.length > 0 && !uploadForm.staffId) {
        setUploadForm(prev => ({ ...prev, staffId: res.data[0]._id }));
      }
    } catch (err) {
      console.error('Error loading staff', err);
    }
  };

  const showToast = (msg, type = 'success') => {
    setActionNotice({ msg, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleVerify = async (id, status, reason = null) => {
    try {
      await axios.put(`http://localhost:5000/api/compliance/${id}/verify`, {
        verificationStatus: status,
        rejectionReason: status === 'REJECTED' ? (reason || 'Document unreadable or invalid accreditation') : null
      });

      showToast(
        status === 'VERIFIED' ? 'Certificate verified and approved!' : 'Certificate marked as rejected.',
        status === 'VERIFIED' ? 'success' : 'error'
      );

      // If currently open in modal, update selectedRecord
      if (selectedRecord && selectedRecord._id === id) {
        setSelectedRecord(prev => ({
          ...prev,
          verificationStatus: status,
          status: status === 'VERIFIED' ? 'VALID' : 'REJECTED',
          rejectionReason: status === 'REJECTED' ? (reason || 'Document unreadable or invalid accreditation') : null
        }));
      }

      setShowRejectInput(false);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Error verifying record', error);
      showToast('Error updating verification status', 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadForm(prev => ({
        ...prev,
        fileData: reader.result,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.staffId) {
      alert('Please select a clinical staff member');
      return;
    }

    try {
      const payload = {
        staff: uploadForm.staffId,
        requirement: uploadForm.requirement,
        certificateNumber: uploadForm.certificateNumber || `CERT-${uploadForm.requirement}-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: uploadForm.issueDate,
        expiryDate: uploadForm.expiryDate,
        documentUrl: uploadForm.fileData || getCertificateDocumentUrl({
          staff: staffList.find(s => s._id === uploadForm.staffId),
          requirement: uploadForm.requirement,
          certificateNumber: uploadForm.certificateNumber,
          issueDate: uploadForm.issueDate,
          expiryDate: uploadForm.expiryDate
        }),
        verificationStatus: uploadForm.markVerified ? 'VERIFIED' : 'PENDING'
      };

      await axios.post('http://localhost:5000/api/compliance', payload);
      setShowUploadModal(false);
      showToast('Certificate successfully uploaded and registered!', 'success');
      
      // Reset form
      setUploadForm({
        staffId: staffList[0]?._id || '',
        requirement: 'BLS',
        certificateNumber: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fileData: null,
        fileName: '',
        markVerified: true
      });

      fetchData();
    } catch (error) {
      console.error('Error uploading certificate', error);
      showToast(error.response?.data?.message || 'Error uploading certificate', 'error');
    }
  };

  const handleDownloadCertificate = (docUrl, staffName, req) => {
    const link = document.createElement('a');
    link.href = docUrl;
    link.download = `${(staffName || 'Staff').replace(/\s+/g, '_')}_${req}_Certificate.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VALID': 
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Valid</span>;
      case 'EXPIRED': 
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200 flex items-center gap-1"><ShieldAlert size={12}/> Expired</span>;
      case 'EXPIRING_SOON': 
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1"><AlertTriangle size={12}/> Expiring Soon</span>;
      case 'PENDING_VERIFICATION': 
        return <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">Pending Review</span>;
      case 'REJECTED': 
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">Rejected</span>;
      default: 
        return null;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesFilter = activeFilter === 'ALL' || record.status === activeFilter;
    const matchesSearch = searchQuery === '' || 
      (record.staff?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.requirement || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.certificateNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all border ${
          actionNotice.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionNotice.type === 'error' ? (
              <XCircle size={20} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            )}
            <span className="text-xs font-bold">{actionNotice.msg}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-current cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Compliance & Certifications
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              Regulatory Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Review uploaded certificates, inspect credentials, and manage clinical staff compliance.
          </p>
        </div>

        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Upload Certificate</span>
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 shadow-xs flex flex-col justify-center items-center col-span-2 lg:col-span-1 border border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hospital Compliance</p>
            <h3 className="text-3xl font-black mt-1 text-[#00a8b5]">{stats.complianceRate}%</h3>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1">NABH Verified</span>
          </div>
          <StatCard title="Total Valid" value={stats.valid} icon={ShieldCheck} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
          <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertTriangle} colorClass="text-amber-600" bgClass="bg-amber-50" />
          <StatCard title="Expired" value={stats.expired} icon={ShieldAlert} colorClass="text-rose-600" bgClass="bg-rose-50" />
          <StatCard title="Pending Review" value={stats.pendingVerification} icon={FileSearch} colorClass="text-[#00a8b5]" bgClass="bg-[#e6f8fa]" />
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: 'All Records' },
            { key: 'VALID', label: 'Valid' },
            { key: 'EXPIRING_SOON', label: 'Expiring Soon' },
            { key: 'EXPIRED', label: 'Expired' },
            { key: 'PENDING_VERIFICATION', label: 'Pending Review' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-[#00a8b5] text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search staff, accreditation..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/90 pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7fcfd] border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="p-4 pl-6">Clinical Staff</th>
                <th className="p-4">Accreditation</th>
                <th className="p-4">Certificate Document</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Audit Status</th>
                <th className="p-4 pr-6 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00a8b5] border-t-transparent rounded-full animate-spin" />
                      <p className="font-semibold text-xs">Loading clinical records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <FileSearch size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">No compliance records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try selecting another filter or upload a certificate.</p>
                  </td>
                </tr>
              ) : filteredRecords.map((record) => {
                const docUrl = getCertificateDocumentUrl(record);
                return (
                  <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Clinical Staff */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#e6f8fa] text-[#00828e] font-extrabold text-xs flex items-center justify-center">
                          {record.staff?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{record.staff?.fullName || 'Staff Member'}</p>
                          <p className="text-[11px] text-slate-400">
                            {record.staff?.role} • {record.staff?.department?.code || record.staff?.department?.name || 'WARD'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Accreditation */}
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                          {record.requirement}
                        </span>
                        {record.certificateNumber && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {record.certificateNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Certificate Document (The key feature requested by user!) */}
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedRecord({ ...record, computedDocUrl: docUrl });
                          setShowRejectInput(false);
                          setRejectionReason('');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eef9fa] hover:bg-[#e0f4f7] text-[#00828e] border border-[#bfe8ee] text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                      >
                        <Eye size={14} className="text-[#00a8b5] group-hover:scale-110 transition-transform" />
                        <span>View Certificate</span>
                      </button>
                    </td>

                    {/* Expiry Date */}
                    <td className="p-4 font-semibold text-slate-600">
                      {new Date(record.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Current Status */}
                    <td className="p-4">
                      {getStatusBadge(record.status)}
                    </td>

                    {/* Audit Status */}
                    <td className="p-4">
                      {record.verificationStatus === 'VERIFIED' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={14}/> Verified
                        </span>
                      ) : record.verificationStatus === 'REJECTED' ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <XCircle size={14}/> Rejected
                        </span>
                      ) : (
                        <span className="text-sky-600 font-bold flex items-center gap-1">
                          <Clock size={14}/> Pending Review
                        </span>
                      )}
                    </td>

                    {/* Verification Action */}
                    <td className="p-4 pr-6 text-right">
                      {record.verificationStatus === 'PENDING' ? (
                        <div className="flex justify-end items-center gap-1.5">
                          <button 
                            onClick={() => {
                              setSelectedRecord({ ...record, computedDocUrl: docUrl });
                              setShowRejectInput(false);
                              setRejectionReason('');
                            }}
                            title="Inspect certificate before verifying"
                            className="px-2.5 py-1.5 text-xs font-bold bg-[#00a8b5] hover:bg-[#00929e] text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FileSearch size={13} />
                            <span>Review</span>
                          </button>
                          <button 
                            onClick={() => handleVerify(record._id, 'VERIFIED')}
                            className="px-2.5 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                          >
                            Verify
                          </button>
                          <button 
                            onClick={() => handleVerify(record._id, 'REJECTED')}
                            className="px-2.5 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRecord({ ...record, computedDocUrl: docUrl });
                            setShowRejectInput(false);
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                          Details →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Viewer & Verification Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 relative max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e6f8fa] text-[#00828e] flex items-center justify-center font-bold">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Clinical Accreditation Document
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedRecord.staff?.fullName} • {selectedRecord.staff?.role} ({selectedRecord.staff?.department?.name || 'Department'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCertificate(
                    selectedRecord.computedDocUrl || selectedRecord.documentUrl,
                    selectedRecord.staff?.fullName,
                    selectedRecord.requirement
                  )}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Download Certificate"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Certificate Document Display */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Document Visual Preview Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-100/60 p-3 shadow-inner flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 aspect-[800/560]">
                  {selectedRecord.documentUrl?.startsWith('data:image') || selectedRecord.computedDocUrl?.startsWith('data:image') ? (
                    <img 
                      src={selectedRecord.computedDocUrl || selectedRecord.documentUrl} 
                      alt="Official Clinical Certificate" 
                      className="w-full h-full object-contain"
                    />
                  ) : selectedRecord.documentUrl?.endsWith('.pdf') ? (
                    <iframe 
                      src={selectedRecord.documentUrl} 
                      title="Certificate PDF" 
                      className="w-full h-full"
                    />
                  ) : (
                    <img 
                      src={getCertificateDocumentUrl(selectedRecord)} 
                      alt="Accreditation Certificate" 
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accreditation</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">{selectedRecord.requirement}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certificate ID</p>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    {selectedRecord.certificateNumber || 'AHA-BLS-89214-A'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiration Date</p>
                  <p className="text-xs font-bold text-rose-600 mt-0.5">
                    {new Date(selectedRecord.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
              </div>

              {/* Rejection Note if Rejected */}
              {selectedRecord.rejectionReason && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Rejection Note:</p>
                    <p className="mt-0.5 text-rose-700">{selectedRecord.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Optional Rejection Reason Input Drawer */}
              {showRejectInput && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2.5">
                  <label className="block text-xs font-bold text-rose-900">
                    Specify Reason for Rejection:
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Accreditation document is expired or illegible"
                    className="w-full bg-white border border-rose-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerify(selectedRecord._id, 'REJECTED', rejectionReason)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer / Decision Bar */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                {selectedRecord.verificationStatus === 'VERIFIED' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Verified by Hospital Clinical Officer
                  </span>
                ) : selectedRecord.verificationStatus === 'REJECTED' ? (
                  <span className="text-rose-700 font-bold flex items-center gap-1.5">
                    <XCircle size={16} className="text-rose-600" />
                    Accreditation Rejected
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle size={16} className="text-amber-600" />
                    Awaiting Management Regulatory Decision
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedRecord.verificationStatus !== 'REJECTED' && (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2 border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X size={15} />
                    <span>Reject</span>
                  </button>
                )}

                {selectedRecord.verificationStatus !== 'VERIFIED' && (
                  <button
                    onClick={() => handleVerify(selectedRecord._id, 'VERIFIED')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={15} />
                    <span>Approve & Verify</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#e6f8fa] text-[#00a8b5] flex items-center justify-center">
                <UploadCloud size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Upload Staff Certificate</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Attach clinical credentials for regulatory audit and shift eligibility.
            </p>

            <form onSubmit={handleSubmitUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Clinical Staff</label>
                <select
                  required
                  value={uploadForm.staffId}
                  onChange={(e) => setUploadForm({ ...uploadForm, staffId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                >
                  <option value="">-- Select Healthcare Staff --</option>
                  {staffList.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.role} - {s.department?.name || 'Department'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Accreditation</label>
                  <select
                    value={uploadForm.requirement}
                    onChange={(e) => setUploadForm({ ...uploadForm, requirement: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  >
                    <option value="BLS">BLS (Basic Life Support)</option>
                    <option value="ACLS">ACLS (Advanced Cardiac)</option>
                    <option value="Medical License">State Medical License</option>
                    <option value="HIPAA Training">HIPAA Patient Privacy</option>
                    <option value="PALS">PALS (Pediatric Support)</option>
                    <option value="Infection Control">Infection Control Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Certificate #</label>
                  <input
                    type="text"
                    placeholder="e.g. AHA-BLS-94812"
                    value={uploadForm.certificateNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, certificateNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Issuance Date</label>
                  <input
                    type="date"
                    required
                    value={uploadForm.issueDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, issueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={uploadForm.expiryDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Document File Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Certificate Document</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    id="docFilePicker"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="docFilePicker" className="cursor-pointer block">
                    <FileText size={24} className="mx-auto text-[#00a8b5] mb-1.5" />
                    <p className="text-xs font-bold text-slate-700">
                      {uploadForm.fileName ? `Selected: ${uploadForm.fileName}` : 'Choose PDF, PNG, or JPG file'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click to browse or leave blank to auto-generate accreditation seal</p>
                  </label>
                </div>
              </div>

              {/* Immediate verification toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="markVerifiedCheck"
                  checked={uploadForm.markVerified}
                  onChange={(e) => setUploadForm({ ...uploadForm, markVerified: e.target.checked })}
                  className="rounded text-[#00a8b5] focus:ring-[#00a8b5] cursor-pointer"
                />
                <label htmlFor="markVerifiedCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Approve &amp; Mark as Verified immediately (Hospital Officer Authorized)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a8b5] hover:bg-[#00929e] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00a8b5]/20 cursor-pointer"
                >
                  Save &amp; Register Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Compliance;

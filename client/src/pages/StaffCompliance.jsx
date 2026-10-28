import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FileCheck, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Sparkles, 
  AlertCircle,
  Eye,
  X,
  Award,
  Download
} from 'lucide-react';

const StaffCompliance = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  // Form details
  const [requirement, setRequirement] = useState('BLS');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  useEffect(() => {
    fetchMyCertificates();
  }, [user]);

  const fetchMyCertificates = async () => {
    try {
      setLoadingRecords(true);
      const res = await axios.get('http://localhost:5000/api/compliance');
      
      const loggedInStaffId = user?.staffId?._id 
        ? user.staffId._id.toString() 
        : (user?.staffId ? user.staffId.toString() : '');
      const loggedInName = (user?.name || '').toLowerCase();

      // Filter to current staff
      const myRecords = res.data.filter(rec => {
        const sId = rec.staff?._id ? rec.staff._id.toString() : (typeof rec.staff === 'string' ? rec.staff : '');
        const sName = (rec.staff?.fullName || '').toLowerCase();
        return (loggedInStaffId && sId === loggedInStaffId) || (loggedInName && sName === loggedInName);
      });

      setRecords(myRecords.length > 0 ? myRecords : res.data.slice(0, 4));
      setLoadingRecords(false);
    } catch (err) {
      console.error('Error fetching staff certificates', err);
      setLoadingRecords(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result);
    };
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file && !fileData) return alert('Please select a certificate file first.');
    setUploading(true);
    setErrorMsg('');

    try {
      // Find staff ID
      let staffId = user?.staffId?._id || user?.staffId;
      if (!staffId) {
        // Fallback: fetch staff list and match by name or pick first
        const sRes = await axios.get('http://localhost:5000/api/staff');
        const matched = sRes.data.find(s => s.fullName?.toLowerCase() === user?.name?.toLowerCase()) || sRes.data[0];
        staffId = matched?._id;
      }

      const payload = {
        staff: staffId,
        requirement,
        certificateNumber: certificateNumber || `CERT-${requirement}-${Math.floor(100000 + Math.random() * 900000)}`,
        expiryDate,
        documentUrl: fileData,
        verificationStatus: 'PENDING'
      };

      await axios.post('http://localhost:5000/api/compliance', payload);

      setUploading(false);
      setSuccess(true);
      setFile(null);
      setFileData(null);
      setCertificateNumber('');
      fetchMyCertificates();
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      console.error('Upload error', err);
      setUploading(false);
      setErrorMsg(err.response?.data?.message || 'Error transmitting certificate to compliance node.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Clinical Accreditations
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f8fa] text-[#00828e] border border-[#bfe8ee]">
              Official Credentials
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Submit renewed BLS, ACLS, or medical licenses for clinical hospital verification.
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-xs">
              Document uploaded successfully!
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              It is now queued on the management compliance review table for verification.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <p className="font-bold text-xs">{errorMsg}</p>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="bg-white p-7 rounded-3xl shadow-xs border border-slate-200/80">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-[#e6f8fa] text-[#00a8b5] flex items-center justify-center">
            <UploadCloud size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Upload Accreditation Document</h3>
            <p className="text-xs text-slate-500">Provide certificate details and attach scanned document or certificate file.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Accreditation</label>
              <select 
                value={requirement} 
                onChange={(e) => setRequirement(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
              >
                <option value="BLS">BLS (Basic Life Support)</option>
                <option value="ACLS">ACLS (Advanced Cardiac)</option>
                <option value="Medical License">State Medical License</option>
                <option value="HIPAA Training">HIPAA Training Certification</option>
                <option value="PALS">PALS (Pediatric Support)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Certificate # / ID</label>
              <input 
                type="text" 
                placeholder="e.g. AHA-BLS-98421"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Expiration Date</label>
              <input 
                type="date" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:outline-none"
              />
            </div>
          </div>

          {/* File Picker Zone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-[#00a8b5] rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <input 
              type="file" 
              id="staffCertUpload" 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileChange} 
            />

            {!file ? (
              <label htmlFor="staffCertUpload" className="cursor-pointer block">
                <FileText size={32} className="mx-auto text-[#00a8b5] mb-2" />
                <p className="font-bold text-xs text-slate-800">Click to Browse Document or Photo</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports PDF, PNG, JPG (Max 15MB)</p>
              </label>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eef9fa] border border-[#00a8b5]/40 text-xs font-bold text-[#00828e] mb-3">
                  <FileText size={16} />
                  <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <div className="flex gap-2">
                  <label 
                    htmlFor="staffCertUpload" 
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Change File
                  </label>
                  <button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="bg-[#00a8b5] hover:bg-[#00929e] active:scale-[0.99] text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-[#00a8b5]/25 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {uploading ? 'Transmitting...' : 'Confirm & Upload'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Certificate Checklist */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Registered Hospital Certificates</h3>
          <span className="text-xs text-slate-400">{records.length} accreditation records</span>
        </div>

        {loadingRecords ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading certificates...</p>
        ) : records.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No certificates uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {records.map(rec => {
              const isVerified = rec.verificationStatus === 'VERIFIED';
              const isRejected = rec.verificationStatus === 'REJECTED';

              return (
                <div 
                  key={rec._id} 
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                    isVerified 
                      ? 'bg-emerald-50/50 border-emerald-200/90' 
                      : isRejected
                      ? 'bg-rose-50/50 border-rose-200/90'
                      : 'bg-sky-50/50 border-sky-200/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={isVerified ? 'text-emerald-600' : isRejected ? 'text-rose-600' : 'text-sky-600'} size={22} />
                    <div>
                      <p className="font-bold text-slate-900">{rec.requirement} Certification</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {rec.certificateNumber || 'Verified ID'} • Expires: {new Date(rec.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isVerified 
                        ? 'bg-emerald-200 text-emerald-800' 
                        : isRejected
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-sky-200 text-sky-800'
                    }`}>
                      {isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending Review'}
                    </span>
                    {rec.documentUrl && (
                      <button
                        onClick={() => setSelectedPreviewDoc(rec)}
                        title="View Certificate Document"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#00828e] cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Staff Certificate Preview Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#00a8b5]" />
                <h3 className="font-bold text-sm text-slate-900">
                  {selectedPreviewDoc.requirement} Certification Document
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-inner aspect-[800/560] flex items-center justify-center">
                {selectedPreviewDoc.documentUrl?.startsWith('data:image') ? (
                  <img src={selectedPreviewDoc.documentUrl} alt="Certificate Preview" className="w-full h-full object-contain" />
                ) : (
                  <iframe src={selectedPreviewDoc.documentUrl} title="Document" className="w-full h-full" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffCompliance;

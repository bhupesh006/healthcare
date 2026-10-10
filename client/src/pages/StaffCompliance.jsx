import React, { useState } from 'react';
import { FileCheck, UploadCloud, CheckCircle } from 'lucide-react';

const StaffCompliance = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = () => {
    if (!file) return alert('Please select a file first.');
    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setFile(null);
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Certifications</h1>
        <p className="text-slate-500">Upload and manage your required medical compliance documents.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} />
          <p className="font-medium">Document uploaded successfully! It is now pending verification by a manager.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center border-dashed border-2 flex flex-col items-center">
        <UploadCloud className="text-slate-400 mb-4" size={48} />
        <h3 className="font-bold text-lg mb-2">Upload New Certificate</h3>
        <p className="text-sm text-slate-500 mb-4">Upload a PDF or Image of your updated certification.</p>
        
        <input 
          type="file" 
          id="certUpload" 
          className="hidden" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
        
        {file && <p className="text-sm font-semibold text-primary mb-4">Selected: {file.name}</p>}

        {!file ? (
          <label htmlFor="certUpload" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2 rounded-lg font-medium cursor-pointer transition-colors">
            Select File
          </label>
        ) : (
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Confirm Upload'}
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffCompliance;

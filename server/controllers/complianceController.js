const Compliance = require('../models/Compliance');

// @desc    Get all compliance records (with filtering)
// @route   GET /api/compliance
const getComplianceRecords = async (req, res) => {
  try {
    const records = await Compliance.find().populate('staff', 'fullName role department');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get compliance dashboard stats
// @route   GET /api/compliance/stats
const getComplianceStats = async (req, res) => {
  try {
    const total = await Compliance.countDocuments();
    const valid = await Compliance.countDocuments({ status: 'VALID' });
    const expiringSoon = await Compliance.countDocuments({ status: 'EXPIRING_SOON' });
    const expired = await Compliance.countDocuments({ status: 'EXPIRED' });
    const pendingVerification = await Compliance.countDocuments({ status: 'PENDING_VERIFICATION' });

    res.json({
      total,
      valid,
      expiringSoon,
      expired,
      pendingVerification,
      complianceRate: total > 0 ? Math.round((valid / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload/Create a compliance record
// @route   POST /api/compliance
const createComplianceRecord = async (req, res) => {
  try {
    const record = new Compliance(req.body);
    // In a real app, calculate status based on expiryDate here
    const today = new Date();
    const expiry = new Date(record.expiryDate);
    const diffTime = Math.abs(expiry - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (expiry < today) {
      record.status = 'EXPIRED';
    } else if (diffDays <= 30) {
      record.status = 'EXPIRING_SOON';
    } else {
      record.status = 'PENDING_VERIFICATION';
    }

    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Verify/Reject a certificate
// @route   PUT /api/compliance/:id/verify
const verifyCompliance = async (req, res) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;
    const recordId = req.params.id;

    const record = await Compliance.findById(recordId);
    if (!record) return res.status(404).json({ message: 'Compliance record not found' });

    record.verificationStatus = verificationStatus;
    record.verifiedAt = new Date();
    
    if (verificationStatus === 'VERIFIED') {
       // Recalculate expiry status when verified
       const today = new Date();
       const expiry = new Date(record.expiryDate);
       const diffTime = Math.abs(expiry - today);
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
       
       if (expiry < today) {
         record.status = 'EXPIRED';
       } else if (diffDays <= 30) {
         record.status = 'EXPIRING_SOON';
       } else {
         record.status = 'VALID';
       }
    } else if (verificationStatus === 'REJECTED') {
       record.status = 'REJECTED';
       record.rejectionReason = rejectionReason;
    }

    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComplianceRecords,
  getComplianceStats,
  createComplianceRecord,
  verifyCompliance
};

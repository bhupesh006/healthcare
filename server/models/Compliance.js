const mongoose = require('mongoose');
require('./Department');
require('./Staff');

const complianceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    requirement: {
      type: String, // e.g., 'BLS', 'ACLS', 'Medical License'
      required: true,
    },
    certificateNumber: String,
    issueDate: Date,
    expiryDate: {
      type: Date,
      required: true,
    },
    documentUrl: String, // URL from cloud storage or local path
    status: {
      type: String,
      enum: ['VALID', 'EXPIRING_SOON', 'EXPIRED', 'MISSING', 'PENDING_VERIFICATION', 'REJECTED'],
      default: 'PENDING_VERIFICATION',
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    rejectionReason: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Compliance', complianceSchema);

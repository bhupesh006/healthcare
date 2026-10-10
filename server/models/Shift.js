const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., '10:00 PM' or ISO string
      required: true,
    },
    endTime: {
      type: String, // e.g., '06:00 AM'
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    location: String,
    shiftType: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'ON_CALL', 'EMERGENCY'],
      required: true,
    },
    requiredStaff: {
      type: Number,
      required: true,
      default: 1,
    },
    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
      }
    ],
    requiredRoles: [
      {
        type: String, // e.g., 'Nurse', 'Doctor'
      }
    ],
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
      }
    ],
    requiredCertifications: [
      {
        type: String, // e.g., 'ACLS', 'BLS'
      }
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'UNDERSTAFFED'],
      default: 'DRAFT',
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Shift', shiftSchema);

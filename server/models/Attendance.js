const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },
    date: {
      type: Date,
      required: true,
    },
    clockIn: {
      type: Date,
    },
    clockOut: {
      type: Date,
    },
    totalHours: {
      type: Number, // calculated in hours
    },
    status: {
      type: String,
      enum: ['PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'LEAVE'],
      default: 'PRESENT',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);

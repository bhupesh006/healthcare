const mongoose = require('mongoose');

const shiftSwapSchema = new mongoose.Schema(
  {
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    replacement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    reason: String,
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED_BY_STAFF', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewComment: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShiftSwap', shiftSwapSchema);

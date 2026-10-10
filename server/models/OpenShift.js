const mongoose = require('mongoose');

const openShiftSchema = new mongoose.Schema(
  {
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: true,
    },
    requestedBy: [
      {
        staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
        requestedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
      }
    ],
    status: {
      type: String,
      enum: ['OPEN', 'FILLED', 'CANCELLED'],
      default: 'OPEN',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OpenShift', openShiftSchema);

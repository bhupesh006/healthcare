const ShiftSwap = require('../models/ShiftSwap');
const Shift = require('../models/Shift');
const { findEligibleStaff } = require('../services/schedulingService');

// @desc    Get all shift swaps
// @route   GET /api/swaps
const getSwaps = async (req, res) => {
  try {
    const swaps = await ShiftSwap.find()
      .populate('shift')
      .populate('requester', 'fullName role')
      .populate('replacement', 'fullName role');
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a shift swap request
// @route   POST /api/swaps
const createSwap = async (req, res) => {
  try {
    const { shift, requester, replacement, reason } = req.body;
    
    // Validate shift exists
    const existingShift = await Shift.findById(shift);
    if (!existingShift) return res.status(404).json({ message: 'Shift not found' });

    // Validate replacement eligibility
    const { eligibleStaff } = await findEligibleStaff(shift);
    const isEligible = eligibleStaff.some(staff => staff._id.toString() === replacement);

    if (!isEligible) {
      return res.status(400).json({ message: 'Swap rejected: Replacement staff is not eligible for this shift (Compliance/Availability rules failed).' });
    }

    const swap = new ShiftSwap({
      shift,
      requester,
      replacement,
      reason,
      status: 'PENDING'
    });

    const savedSwap = await swap.save();
    res.status(201).json(savedSwap);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve/Reject Swap
// @route   PUT /api/swaps/:id/status
const updateSwapStatus = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;
    const swapId = req.params.id;

    const swap = await ShiftSwap.findById(swapId);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    swap.status = status;
    if (reviewComment) swap.reviewComment = reviewComment;

    await swap.save();

    // If swap is approved, update the roster
    if (status === 'APPROVED') {
      const shift = await Shift.findById(swap.shift);
      
      // Remove requester
      shift.assignedStaff = shift.assignedStaff.filter(id => id.toString() !== swap.requester.toString());
      
      // Add replacement
      if (!shift.assignedStaff.includes(swap.replacement)) {
        shift.assignedStaff.push(swap.replacement);
      }

      await shift.save();
    }

    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSwaps,
  createSwap,
  updateSwapStatus
};

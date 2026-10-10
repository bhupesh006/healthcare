const Shift = require('../models/Shift');
const { findEligibleStaff } = require('../services/schedulingService');

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private
const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('department')
      .populate('assignedStaff', 'fullName role')
      .populate('applicants', 'fullName role phone email');
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new shift
// @route   POST /api/shifts
// @access  Private (Admin/Manager)
const createShift = async (req, res) => {
  try {
    const shift = new Shift(req.body);
    const savedShift = await shift.save();
    res.status(201).json(savedShift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get eligible staff for a shift
// @route   GET /api/shifts/:id/eligible-staff
// @access  Private (Admin/Manager)
const getEligibleStaff = async (req, res) => {
  try {
    const result = await findEligibleStaff(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign staff to shift
// @route   POST /api/shifts/:id/assign
// @access  Private (Admin/Manager)
const assignStaff = async (req, res) => {
  try {
    const { staffId } = req.body;
    const shiftId = req.params.id;

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    if (shift.assignedStaff.includes(staffId)) {
      return res.status(400).json({ message: 'Staff already assigned to this shift' });
    }

    // Run eligibility check before assignment
    const { eligibleStaff } = await findEligibleStaff(shiftId);
    const isEligible = eligibleStaff.some(staff => staff._id.toString() === staffId);
    
    if (!isEligible) {
      return res.status(400).json({ message: 'Assignment blocked: Staff is not eligible for this shift' });
    }

    shift.assignedStaff.push(staffId);
    
    // Remove from applicants if present
    shift.applicants = shift.applicants.filter(appId => appId.toString() !== staffId);

    // Update shift status if required staff is met
    if (shift.assignedStaff.length >= shift.requiredStaff) {
      shift.status = 'PUBLISHED';
    }

    await shift.save();
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for an open shift
// @route   POST /api/shifts/:id/apply
// @access  Private (Staff)
const applyForShift = async (req, res) => {
  try {
    const { staffId } = req.body;
    const shiftId = req.params.id;

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    if (shift.applicants.some(appId => appId.toString() === staffId)) {
      return res.status(400).json({ message: 'You have already applied for this shift' });
    }

    shift.applicants.push(staffId);
    await shift.save();

    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getShifts,
  createShift,
  getEligibleStaff,
  assignStaff,
  applyForShift
};

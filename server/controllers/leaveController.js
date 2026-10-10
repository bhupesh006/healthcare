const Leave = require('../models/Leave');
const Shift = require('../models/Shift');

// @desc    Get all leave requests
// @route   GET /api/leaves
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('staff', 'fullName role');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
const applyLeave = async (req, res) => {
  try {
    const leave = new Leave(req.body);
    const savedLeave = await leave.save();
    res.status(201).json(savedLeave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve/Reject Leave
// @route   PUT /api/leaves/:id/status
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;
    const leaveId = req.params.id;

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.status = status;
    if (reviewComment) leave.reviewComment = reviewComment;

    await leave.save();

    // If leave is approved, we should check if they are already scheduled for a shift during this time
    // and automatically remove them, marking the shift as UNDERSTAFFED if necessary.
    if (status === 'APPROVED') {
      const overlappingShifts = await Shift.find({
        assignedStaff: leave.staff,
        date: { $gte: leave.startDate, $lte: leave.endDate }
      });

      for (let shift of overlappingShifts) {
        // Remove staff from shift
        shift.assignedStaff = shift.assignedStaff.filter(id => id.toString() !== leave.staff.toString());
        
        // Update shift status
        if (shift.assignedStaff.length < shift.requiredStaff) {
          shift.status = 'UNDERSTAFFED';
        }
        await shift.save();
      }
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check impact of leave approval
// @route   GET /api/leaves/:id/impact
// @access  Private (Admin/Manager)
const checkLeaveImpact = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const leave = await Leave.findById(leaveId).populate('staff', 'fullName');
    
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    const overlappingShifts = await Shift.find({
      assignedStaff: leave.staff._id,
      date: { $gte: leave.startDate, $lte: leave.endDate }
    });

    res.json({
      overlappingShiftsCount: overlappingShifts.length,
      shifts: overlappingShifts,
      warning: overlappingShifts.length > 0 
        ? `Approving this leave will remove ${leave.staff.fullName} from ${overlappingShifts.length} shift(s).`
        : 'No shift conflicts detected.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  checkLeaveImpact
};

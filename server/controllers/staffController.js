const Staff = require('../models/Staff');

// @desc    Get all staff members
// @route   GET /api/staff
const getStaff = async (req, res) => {
  try {
    const staffMembers = await Staff.find().populate('department', 'name code');
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('department', 'name code');
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStaff,
  getStaffById
};

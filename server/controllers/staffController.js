const Staff = require('../models/Staff');
const Department = require('../models/Department');

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

// @desc    Create a new staff member
// @route   POST /api/staff
const createStaff = async (req, res) => {
  try {
    const { fullName, role, employeeId, department, email, phone, certifications } = req.body;

    // Resolve department
    let deptId = department;
    if (department && typeof department === 'string' && !department.match(/^[0-9a-fA-F]{24}$/)) {
      const d = await Department.findOne({ name: new RegExp(department, 'i') });
      if (d) deptId = d._id;
      else {
        const firstDept = await Department.findOne();
        if (firstDept) deptId = firstDept._id;
      }
    }

    const newStaff = await Staff.create({
      fullName,
      role: role || 'Nurse',
      employeeId: employeeId || `EMP${Date.now().toString().slice(-4)}`,
      department: deptId,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '')}@hospital.com`,
      phone: phone || '555-0100',
      certifications: certifications || ['BLS Healthcare Provider'],
      status: 'ACTIVE'
    });

    const populated = await Staff.findById(newStaff._id).populate('department', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  deleteStaff
};

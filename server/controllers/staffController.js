const Staff = require('../models/Staff');
const Department = require('../models/Department');
const User = require('../models/User');
const Compliance = require('../models/Compliance');
const bcrypt = require('bcryptjs');

// @desc    Get all staff members
// @route   GET /api/staff
const getStaff = async (req, res) => {
  try {
    const staffMembers = await Staff.find().populate('department', 'name code').sort({ createdAt: -1 });
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
    const {
      fullName,
      role,
      employeeId,
      department,
      email,
      phone,
      certifications,
      employmentType,
      joiningDate,
      status,
      password
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    const trimmedName = fullName.trim();
    const staffEmail = (email && email.trim())
      ? email.trim().toLowerCase()
      : `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.com`;

    // 1. Check if staff already exists with this email
    const existingStaffEmail = await Staff.findOne({ email: staffEmail });
    if (existingStaffEmail) {
      return res.status(400).json({ message: `Staff member with email "${staffEmail}" already exists.` });
    }

    // 2. Resolve or generate unique Employee ID
    let finalEmpId = (employeeId && employeeId.trim()) ? employeeId.trim().toUpperCase() : null;
    if (finalEmpId) {
      const existingEmpId = await Staff.findOne({ employeeId: finalEmpId });
      if (existingEmpId) {
        return res.status(400).json({ message: `Employee ID "${finalEmpId}" is already assigned to another staff member.` });
      }
    } else {
      const staffCount = await Staff.countDocuments();
      let counter = staffCount + 1;
      let candidate = `EMP${String(counter).padStart(3, '0')}`;
      while (await Staff.findOne({ employeeId: candidate })) {
        counter++;
        candidate = `EMP${String(counter).padStart(3, '0')}`;
      }
      finalEmpId = candidate;
    }

    // 3. Resolve department
    let deptId = department;
    if (!deptId || (typeof deptId === 'string' && !deptId.match(/^[0-9a-fA-F]{24}$/))) {
      let d = null;
      if (deptId && typeof deptId === 'string') {
        d = await Department.findOne({ name: new RegExp('^' + deptId.trim() + '$', 'i') });
        if (!d) {
          d = await Department.findOne({ name: new RegExp(deptId.trim(), 'i') });
        }
      }
      if (!d) {
        d = await Department.findOne();
      }
      if (!d) {
        d = await Department.create({ name: 'Emergency', code: 'ER', description: 'Emergency Department' });
      }
      deptId = d._id;
    }

    // 4. Create or find User account
    let user = await User.findOne({ email: staffEmail });
    if (!user) {
      const rawPassword = password || 'password123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      user = await User.create({
        name: trimmedName,
        email: staffEmail,
        password: hashedPassword,
        role: 'STAFF',
        department: deptId,
        isActive: true
      });
    }

    // 5. Create Staff record
    const newStaff = await Staff.create({
      userId: user._id,
      employeeId: finalEmpId,
      fullName: trimmedName,
      email: staffEmail,
      phone: (phone && phone.trim()) ? phone.trim() : '555-0100',
      role: role || 'Nurse',
      department: deptId,
      employmentType: employmentType || 'FULL_TIME',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: status || 'ACTIVE',
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      }
    });

    // Link user to staff record
    user.staffId = newStaff._id;
    if (!user.department) user.department = deptId;
    await user.save();

    // 6. Automatically create standard compliance credentials for clinical profile
    try {
      const defaultCerts = Array.isArray(certifications) && certifications.length > 0
        ? certifications
        : ['BLS', 'ACLS'];

      for (const cert of defaultCerts) {
        const certName = typeof cert === 'string' ? cert : cert.requirement || 'BLS';
        await Compliance.create({
          staff: newStaff._id,
          requirement: certName,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 years
          status: 'VALID',
          verificationStatus: 'VERIFIED'
        });
      }
    } catch (compErr) {
      console.warn('Compliance auto-creation non-fatal warning:', compErr.message);
    }

    // 7. Return populated Staff document
    const populated = await Staff.findById(newStaff._id).populate('department', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ message: error.message || 'Failed to register staff member' });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    if (staff.userId) {
      await User.findByIdAndDelete(staff.userId);
    }
    await Compliance.deleteMany({ staff: staff._id });
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

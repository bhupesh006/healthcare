const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: '../.env' });

// Load models
const User = require('../models/User');
const Staff = require('../models/Staff');
const Department = require('../models/Department');
const Shift = require('../models/Shift');
const Compliance = require('../models/Compliance');
const Leave = require('../models/Leave');
const ShiftSwap = require('../models/ShiftSwap');
const Notification = require('../models/Notification');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthplus');

const seedData = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany();
    await Staff.deleteMany();
    await Department.deleteMany();
    await Shift.deleteMany();
    await Compliance.deleteMany();
    await Leave.deleteMany();
    await ShiftSwap.deleteMany();
    await Notification.deleteMany();

    console.log('Data cleared...');

    // 2. Create Departments
    const deptER = await Department.create({ name: 'Emergency', code: 'ER', description: 'Emergency Department' });
    const deptICU = await Department.create({ name: 'ICU', code: 'ICU', description: 'Intensive Care Unit' });
    const deptGW = await Department.create({ name: 'General Ward', code: 'GW', description: 'General Ward' });

    console.log('Departments created...');

    // 3. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@healthcare.com',
      password: hashedPassword,
      role: 'ADMIN',
    });

    const managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@healthcare.com',
      password: hashedPassword,
      role: 'MANAGER',
      department: deptER._id
    });

    console.log('Admin & Manager created...');

    // 4. Create Staff Profiles (Matching the demo scenario from requirements)
    const staffData = [
      { name: 'Arun', role: 'Nurse', email: 'arun@hc.com', phone: '11111111', empId: 'EMP001' },
      { name: 'Priya', role: 'Nurse', email: 'priya@hc.com', phone: '22222222', empId: 'EMP002' },
      { name: 'Kumar', role: 'Nurse', email: 'kumar@hc.com', phone: '33333333', empId: 'EMP003' },
      { name: 'Divya', role: 'Nurse', email: 'divya@hc.com', phone: '44444444', empId: 'EMP004' },
      { name: 'Meena', role: 'Nurse', email: 'meena@hc.com', phone: '55555555', empId: 'EMP005' },
    ];

    const createdStaff = [];
    for (let s of staffData) {
      const user = await User.create({
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: 'STAFF',
      });

      const staff = await Staff.create({
        userId: user._id,
        employeeId: s.empId,
        fullName: s.name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        department: deptER._id,
        joiningDate: new Date('2024-01-01'),
        availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true }
      });
      
      user.staffId = staff._id;
      await user.save();
      createdStaff.push(staff);
    }

    console.log('Staff profiles created...');

    // 5. Create Compliance Records (To test the assignment engine logic)
    
    // Arun: All Valid
    await Compliance.create({ staff: createdStaff[0]._id, requirement: 'BLS', expiryDate: new Date('2028-01-01'), status: 'VALID' });
    await Compliance.create({ staff: createdStaff[0]._id, requirement: 'ACLS', expiryDate: new Date('2028-01-01'), status: 'VALID' });

    // Priya: ACLS Expired
    await Compliance.create({ staff: createdStaff[1]._id, requirement: 'BLS', expiryDate: new Date('2028-01-01'), status: 'VALID' });
    await Compliance.create({ staff: createdStaff[1]._id, requirement: 'ACLS', expiryDate: new Date('2025-01-01'), status: 'EXPIRED' });

    // Kumar, Divya, Meena: All Valid for basic logic testing
    for(let i=2; i<5; i++){
       await Compliance.create({ staff: createdStaff[i]._id, requirement: 'BLS', expiryDate: new Date('2028-01-01'), status: 'VALID', verificationStatus: 'VERIFIED' });
       await Compliance.create({ staff: createdStaff[i]._id, requirement: 'ACLS', expiryDate: new Date('2028-01-01'), status: 'VALID', verificationStatus: 'VERIFIED' });
    }

    // Add some Pending Verification Records
    await Compliance.create({ staff: createdStaff[0]._id, requirement: 'Medical License', expiryDate: new Date('2029-01-01'), status: 'PENDING_VERIFICATION', verificationStatus: 'PENDING' });
    await Compliance.create({ staff: createdStaff[1]._id, requirement: 'HIPAA Training', expiryDate: new Date('2025-06-01'), status: 'PENDING_VERIFICATION', verificationStatus: 'PENDING' });

    console.log('Compliance records created...');

    // 6. Create Shifts
    
    // Kumar gets a conflicting shift today
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 4);

    await Shift.create({
      date: today,
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      department: deptER._id,
      shiftType: 'MORNING',
      requiredStaff: 2,
      assignedStaff: [createdStaff[2]._id, createdStaff[3]._id], // Kumar, Divya
      status: 'PUBLISHED'
    });

    await Shift.create({
      date: tomorrow,
      startTime: '02:00 PM',
      endTime: '10:00 PM',
      department: deptICU._id,
      shiftType: 'AFTERNOON',
      requiredStaff: 3,
      assignedStaff: [createdStaff[0]._id, createdStaff[4]._id], // Arun, Meena
      status: 'UNDERSTAFFED'
    });

    await Shift.create({
      date: yesterday,
      startTime: '10:00 PM',
      endTime: '06:00 AM',
      department: deptER._id,
      shiftType: 'NIGHT',
      requiredStaff: 2,
      assignedStaff: [createdStaff[1]._id, createdStaff[2]._id], // Priya, Kumar
      status: 'COMPLETED'
    });

    await Shift.create({
      date: nextWeek,
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      department: deptICU._id,
      shiftType: 'MORNING',
      requiredStaff: 4,
      assignedStaff: [createdStaff[3]._id], // Divya
      status: 'UNDERSTAFFED'
    });

    // Create the target shift for the demo: ER Night Shift requiring ACLS & BLS
    const targetShift = await Shift.create({
      date: today,
      startTime: '10:00 PM',
      endTime: '06:00 AM',
      department: deptER._id,
      shiftType: 'NIGHT',
      requiredStaff: 5,
      requiredRoles: ['Nurse'],
      requiredCertifications: ['BLS', 'ACLS'],
      status: 'UNDERSTAFFED',
      createdBy: managerUser._id
    });

    console.log('Shifts created...');
    
    // 7. Create Leave Requests
    await Leave.create({
      staff: createdStaff[2]._id, // Kumar
      leaveType: 'SICK',
      startDate: new Date(today.setHours(0,0,0,0)), // Today
      endDate: new Date(today.setHours(23,59,59,999)),
      reason: 'Fever and cold',
      status: 'PENDING'
    });

    await Leave.create({
      staff: createdStaff[1]._id, // Priya
      leaveType: 'ANNUAL',
      startDate: new Date(nextWeek.setHours(0,0,0,0)),
      endDate: new Date(nextWeek.setDate(nextWeek.getDate() + 3)),
      reason: 'Family trip',
      status: 'APPROVED'
    });
    console.log('Leave requests created...');

    // 8. Create Shift Swap Requests
    await ShiftSwap.create({
      shift: targetShift._id, // the night shift
      requester: createdStaff[2]._id, // Kumar
      replacement: createdStaff[0]._id, // Arun
      reason: 'Family emergency',
      status: 'PENDING'
    });

    const completedSwapShift = await Shift.findOne({ shiftType: 'NIGHT', status: 'COMPLETED' });
    if(completedSwapShift) {
      await ShiftSwap.create({
        shift: completedSwapShift._id,
        requester: createdStaff[4]._id, // Meena
        replacement: createdStaff[1]._id, // Priya
        reason: 'Personal appointment',
        status: 'APPROVED'
      });
    }
    console.log('Swap requests created...');

    // 9. Create Notifications
    await Notification.create({
      user: managerUser._id,
      type: 'WARNING',
      title: 'ACLS Expiring Soon',
      message: 'Nurse Priya\'s ACLS certification expires in 12 days.',
    });
    
    await Notification.create({
      user: managerUser._id,
      type: 'ALERT',
      title: 'Understaffed Shift',
      message: 'Emergency Department Night Shift is understaffed (5 Nurses Required).',
    });

    await Notification.create({
      user: managerUser._id,
      type: 'INFO',
      title: 'New Leave Request',
      message: 'Kumar has submitted a Sick Leave request requiring approval.',
    });
    console.log('Notifications created...');

    console.log('Target Shift ID for demo: ', targetShift._id.toString());
    console.log('Data Import Success!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

seedData();

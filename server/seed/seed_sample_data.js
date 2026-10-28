const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Staff = require('../models/Staff');
const Department = require('../models/Department');
const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const Compliance = require('../models/Compliance');
const Leave = require('../models/Leave');
const ShiftSwap = require('../models/ShiftSwap');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthplus';

const seedSampleData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB healthplus for seeding sample data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Departments
    const deptDefs = [
      { name: 'Emergency', code: 'ER', description: 'Emergency Department & Trauma Center' },
      { name: 'ICU', code: 'ICU', description: 'Intensive Critical Care Unit' },
      { name: 'General Ward', code: 'GW', description: 'General Inpatient Ward' },
      { name: 'Cardiology', code: 'CARD', description: 'Cardiology & Catheterization Unit' },
      { name: 'Pediatrics', code: 'PED', description: 'Pediatric Care & Neonatal Unit' }
    ];

    const depts = {};
    for (const d of deptDefs) {
      let dept = await Department.findOne({ code: d.code });
      if (!dept) {
        dept = await Department.create(d);
      }
      depts[d.code] = dept;
    }
    console.log('Departments verified:', Object.keys(depts));

    // 2. Management Users (Admin & Manager)
    let adminUser = await User.findOne({ email: 'admin@healthcare.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@healthcare.com',
        password: hashedPassword,
        role: 'ADMIN',
        department: depts.ER._id
      });
    }

    let managerUser = await User.findOne({ email: 'manager@healthcare.com' });
    if (!managerUser) {
      managerUser = await User.create({
        name: 'Hospital Manager',
        email: 'manager@healthcare.com',
        password: hashedPassword,
        role: 'MANAGER',
        department: depts.ER._id
      });
    }

    // 3. Clinical Staff Definitions
    const staffDefinitions = [
      {
        fullName: 'vanitha',
        email: 'vanitha@hc.com',
        role: 'Nurse',
        department: depts.ER._id,
        phone: '555-0101',
        employeeId: 'EMP001',
        employmentType: 'FULL_TIME'
      },
      {
        fullName: 'seetha',
        email: 'seetha@hc.com',
        role: 'Nurse',
        department: depts.ICU._id,
        phone: '555-0102',
        employeeId: 'EMP002',
        employmentType: 'FULL_TIME'
      },
      {
        fullName: 'Dr. Rajesh Sharma',
        email: 'rajesh@healthcare.com',
        role: 'Doctor',
        department: depts.CARD._id,
        phone: '555-0103',
        employeeId: 'EMP003',
        employmentType: 'FULL_TIME'
      },
      {
        fullName: 'Dr. Jennifer Adams',
        email: 'jennifer@healthcare.com',
        role: 'Doctor',
        department: depts.ER._id,
        phone: '555-0104',
        employeeId: 'EMP004',
        employmentType: 'FULL_TIME'
      },
      {
        fullName: 'Nurse Priya Nair',
        email: 'priya@healthcare.com',
        role: 'Nurse',
        department: depts.ICU._id,
        phone: '555-0105',
        employeeId: 'EMP005',
        employmentType: 'FULL_TIME'
      },
      {
        fullName: 'Nurse Kumar Swamy',
        email: 'kumar@healthcare.com',
        role: 'Nurse',
        department: depts.GW._id,
        phone: '555-0106',
        employeeId: 'EMP006',
        employmentType: 'FULL_TIME'
      },
      {
        fullName: 'Dr. Ananya Reddy',
        email: 'ananya@healthcare.com',
        role: 'Doctor',
        department: depts.PED._id,
        phone: '555-0107',
        employeeId: 'EMP007',
        employmentType: 'FULL_TIME'
      },
      {
        fullName: 'Nurse Meena Iyer',
        email: 'meena@healthcare.com',
        role: 'Nurse',
        department: depts.GW._id,
        phone: '555-0108',
        employeeId: 'EMP008',
        employmentType: 'FULL_TIME'
      }
    ];

    const staffMap = {};

    for (const s of staffDefinitions) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create({
          name: s.fullName,
          email: s.email,
          password: hashedPassword,
          role: 'STAFF',
          department: s.department,
          isActive: true
        });
      }

      let staffDoc = await Staff.findOne({ email: s.email });
      if (!staffDoc) {
        staffDoc = await Staff.create({
          userId: user._id,
          employeeId: s.employeeId,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone,
          role: s.role,
          department: s.department,
          employmentType: s.employmentType,
          joiningDate: new Date('2024-01-15'),
          status: 'ACTIVE',
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
      }

      user.staffId = staffDoc._id;
      await user.save();

      staffMap[s.email] = staffDoc;
    }
    console.log(`Staff profiles verified: ${Object.keys(staffMap).length} staff members.`);

    // 4. Compliance Records (Certifications)
    // Clear and re-populate rich accredited certifications
    await Compliance.deleteMany({});

    for (const [email, staffDoc] of Object.entries(staffMap)) {
      // Standard BLS & ACLS
      const isPriya = email === 'priya@healthcare.com';
      const isKumar = email === 'kumar@healthcare.com';

      // BLS
      await Compliance.create({
        staff: staffDoc._id,
        requirement: 'BLS',
        certificateNumber: `BLS-${staffDoc.employeeId}-2026`,
        issueDate: new Date('2024-05-10'),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 yrs
        status: 'VALID',
        verificationStatus: 'VERIFIED',
        verifiedBy: adminUser._id,
        verifiedAt: new Date()
      });

      // ACLS
      await Compliance.create({
        staff: staffDoc._id,
        requirement: 'ACLS',
        certificateNumber: `ACLS-${staffDoc.employeeId}-2026`,
        issueDate: new Date('2024-06-15'),
        // For Priya, set expiring soon (12 days) to trigger renewal alerts!
        expiryDate: isPriya
          ? new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2),
        status: isPriya ? 'EXPIRING_SOON' : 'VALID',
        verificationStatus: isKumar ? 'PENDING' : 'VERIFIED',
        verifiedBy: isKumar ? null : adminUser._id,
        verifiedAt: isKumar ? null : new Date()
      });

      // Doctor State Medical Licenses
      if (staffDoc.role === 'Doctor') {
        await Compliance.create({
          staff: staffDoc._id,
          requirement: 'Medical License',
          certificateNumber: `MD-LIC-${staffDoc.employeeId}-9812`,
          issueDate: new Date('2023-01-01'),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3),
          status: 'VALID',
          verificationStatus: 'VERIFIED',
          verifiedBy: adminUser._id,
          verifiedAt: new Date()
        });
      }
    }
    console.log('Compliance credentials populated.');

    // 5. Shifts (Dates relative to today)
    await Shift.deleteMany({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDayOffset = (offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d;
    };

    const shiftData = [
      // TODAY
      {
        date: getDayOffset(0),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: depts.ER._id,
        shiftType: 'MORNING',
        requiredStaff: 2,
        assignedStaff: [staffMap['vanitha@hc.com']._id, staffMap['jennifer@healthcare.com']._id],
        status: 'PUBLISHED'
      },
      {
        date: getDayOffset(0),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: depts.ICU._id,
        shiftType: 'MORNING',
        requiredStaff: 2,
        assignedStaff: [staffMap['seetha@hc.com']._id],
        status: 'UNDERSTAFFED' // 1 alert for ICU
      },
      {
        date: getDayOffset(0),
        startTime: '04:00 PM',
        endTime: '12:00 AM',
        department: depts.CARD._id,
        shiftType: 'AFTERNOON',
        requiredStaff: 1,
        assignedStaff: [staffMap['rajesh@healthcare.com']._id],
        status: 'PUBLISHED'
      },
      {
        date: getDayOffset(0),
        startTime: '12:00 AM',
        endTime: '08:00 AM',
        department: depts.ICU._id,
        shiftType: 'NIGHT',
        requiredStaff: 2,
        assignedStaff: [staffMap['priya@healthcare.com']._id],
        status: 'UNDERSTAFFED'
      },

      // TOMORROW
      {
        date: getDayOffset(1),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: depts.GW._id,
        shiftType: 'MORNING',
        requiredStaff: 2,
        assignedStaff: [staffMap['kumar@healthcare.com']._id, staffMap['meena@healthcare.com']._id],
        status: 'PUBLISHED'
      },
      {
        date: getDayOffset(1),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: depts.PED._id,
        shiftType: 'MORNING',
        requiredStaff: 1,
        assignedStaff: [staffMap['ananya@healthcare.com']._id],
        status: 'PUBLISHED'
      },
      {
        date: getDayOffset(1),
        startTime: '04:00 PM',
        endTime: '12:00 AM',
        department: depts.ER._id,
        shiftType: 'AFTERNOON',
        requiredStaff: 2,
        assignedStaff: [], // Open shift in marketplace!
        status: 'UNDERSTAFFED'
      },

      // YESTERDAY
      {
        date: getDayOffset(-1),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: depts.ER._id,
        shiftType: 'MORNING',
        requiredStaff: 2,
        assignedStaff: [staffMap['vanitha@hc.com']._id, staffMap['jennifer@healthcare.com']._id],
        status: 'COMPLETED'
      },
      {
        date: getDayOffset(-1),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: depts.ICU._id,
        shiftType: 'MORNING',
        requiredStaff: 1,
        assignedStaff: [staffMap['seetha@hc.com']._id],
        status: 'COMPLETED'
      },

      // +2 DAYS
      {
        date: getDayOffset(2),
        startTime: '08:00 AM',
        endTime: '04:00 PM',
        department: depts.ER._id,
        shiftType: 'MORNING',
        requiredStaff: 2,
        assignedStaff: [staffMap['vanitha@hc.com']._id],
        status: 'UNDERSTAFFED' // Open shift slot
      },
      {
        date: getDayOffset(2),
        startTime: '04:00 PM',
        endTime: '12:00 AM',
        department: depts.GW._id,
        shiftType: 'AFTERNOON',
        requiredStaff: 1,
        assignedStaff: [],
        status: 'UNDERSTAFFED' // Open shift slot
      }
    ];

    const createdShifts = await Shift.insertMany(shiftData);
    console.log(`Shifts created: ${createdShifts.length} clinical shifts.`);

    // 6. Attendance Records
    await Attendance.deleteMany({});

    // Today's live active on-duty personnel
    await Attendance.create({
      staff: staffMap['vanitha@hc.com']._id,
      shift: createdShifts[0]._id,
      date: getDayOffset(0),
      clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), // Clocked in 4 hours ago
      status: 'ON_DUTY',
      biometricVerified: true,
      biometricTerminalId: 'BIO-TER-ER-01',
      location: 'Emergency Checkpoint Terminal A',
      notes: 'Biometric fingerprint scan verified on arrival'
    });

    await Attendance.create({
      staff: staffMap['seetha@hc.com']._id,
      shift: createdShifts[1]._id,
      date: getDayOffset(0),
      clockIn: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
      status: 'ON_DUTY',
      biometricVerified: true,
      biometricTerminalId: 'BIO-TER-ICU-02',
      location: 'ICU Unit Terminal B',
      notes: 'Biometric arrival recorded'
    });

    await Attendance.create({
      staff: staffMap['jennifer@healthcare.com']._id,
      shift: createdShifts[0]._id,
      date: getDayOffset(0),
      clockIn: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
      status: 'PRESENT',
      biometricVerified: true,
      biometricTerminalId: 'BIO-TER-ER-01',
      location: 'Emergency Checkpoint Terminal A'
    });

    // Yesterday's completed shifts (logged hours)
    await Attendance.create({
      staff: staffMap['vanitha@hc.com']._id,
      date: getDayOffset(-1),
      clockIn: new Date(getDayOffset(-1).setHours(8, 0, 0, 0)),
      clockOut: new Date(getDayOffset(-1).setHours(16, 0, 0, 0)),
      totalHours: 8,
      status: 'PRESENT',
      biometricVerified: true,
      biometricTerminalId: 'BIO-TER-ER-01',
      location: 'Emergency Terminal A'
    });

    await Attendance.create({
      staff: staffMap['seetha@hc.com']._id,
      date: getDayOffset(-1),
      clockIn: new Date(getDayOffset(-1).setHours(7, 58, 0, 0)),
      clockOut: new Date(getDayOffset(-1).setHours(16, 2, 0, 0)),
      totalHours: 8,
      status: 'PRESENT',
      biometricVerified: true,
      biometricTerminalId: 'BIO-TER-ICU-02',
      location: 'ICU Terminal B'
    });

    await Attendance.create({
      staff: staffMap['rajesh@healthcare.com']._id,
      date: getDayOffset(-1),
      clockIn: new Date(getDayOffset(-1).setHours(8, 30, 0, 0)),
      clockOut: new Date(getDayOffset(-1).setHours(16, 30, 0, 0)),
      totalHours: 8,
      status: 'PRESENT',
      biometricVerified: true,
      biometricTerminalId: 'BIO-TER-CARD-01',
      location: 'Cardiology Checkpoint'
    });

    console.log('Attendance records populated.');

    // 7. Leave Requests
    await Leave.deleteMany({});

    await Leave.create({
      staff: staffMap['priya@healthcare.com']._id,
      leaveType: 'CASUAL',
      startDate: getDayOffset(4),
      endDate: getDayOffset(6),
      reason: 'Attending family wedding and travel commitments',
      status: 'PENDING'
    });

    await Leave.create({
      staff: staffMap['rajesh@healthcare.com']._id,
      leaveType: 'MEDICAL',
      startDate: getDayOffset(7),
      endDate: getDayOffset(8),
      reason: 'Keynote lecture at Annual Cardiology Interventional Summit',
      status: 'PENDING'
    });

    await Leave.create({
      staff: staffMap['kumar@healthcare.com']._id,
      leaveType: 'SICK',
      startDate: getDayOffset(-2),
      endDate: getDayOffset(-1),
      reason: 'Severe viral influenza and prescribed medical convalescence',
      status: 'APPROVED',
      reviewedBy: managerUser._id,
      reviewComment: 'Approved with medical certificate verified.'
    });

    console.log('Leave requests populated.');

    // 8. Shift Swaps
    await ShiftSwap.deleteMany({});

    // Peer swap 1: Vanitha requesting Seetha for tomorrow's shift
    await ShiftSwap.create({
      shift: createdShifts[4]._id, // Tomorrow GW shift
      requester: staffMap['vanitha@hc.com']._id,
      replacement: staffMap['seetha@hc.com']._id,
      reason: 'Need morning off for routine medical specialist appointment',
      status: 'PENDING'
    });

    // Peer swap 2: Priya and Kumar - Accepted by peer, ready for manager approval!
    await ShiftSwap.create({
      shift: createdShifts[0]._id,
      requester: staffMap['priya@healthcare.com']._id,
      replacement: staffMap['kumar@healthcare.com']._id,
      reason: 'Coverage exchange agreed for weekend schedule balance',
      status: 'ACCEPTED_BY_STAFF'
    });

    // Peer swap 3: Approved
    await ShiftSwap.create({
      shift: createdShifts[7]._id,
      requester: staffMap['jennifer@healthcare.com']._id,
      replacement: staffMap['rajesh@healthcare.com']._id,
      reason: 'Shift swap for clinical consultation rounds',
      status: 'APPROVED',
      reviewedBy: managerUser._id,
      reviewComment: 'Approved. Both clinicians credentialed for unit coverage.'
    });

    console.log('Shift swaps populated.');

    // 9. Notifications
    await Notification.deleteMany({});

    await Notification.create({
      user: adminUser._id,
      type: 'WARNING',
      title: 'ICU Unit Understaffed',
      message: 'ICU Night Shift requires 1 additional registered critical-care nurse.',
      isRead: false
    });

    await Notification.create({
      user: adminUser._id,
      type: 'ALERT',
      title: 'ACLS Renewal Due Soon',
      message: 'Nurse Priya Nair ACLS certificate expires in 12 days. Renewal audit requested.',
      isRead: false
    });

    await Notification.create({
      user: adminUser._id,
      type: 'INFO',
      title: 'Shift Swap Ready For Approval',
      message: 'Nurse Priya & Nurse Kumar swap request accepted by staff, pending manager approval.',
      isRead: false
    });

    await Notification.create({
      user: adminUser._id,
      type: 'INFO',
      title: 'Leave Request Submitted',
      message: 'Dr. Rajesh Sharma submitted a medical conference leave request.',
      isRead: true
    });

    // Notifications for Vanitha
    const vanithaUser = await User.findOne({ email: 'vanitha@hc.com' });
    if (vanithaUser) {
      await Notification.create({
        user: vanithaUser._id,
        type: 'SUCCESS',
        title: 'Assigned Shift Confirmed',
        message: 'You are on duty today for Emergency Morning Shift (08:00 AM – 04:00 PM).',
        isRead: false
      });
      await Notification.create({
        user: vanithaUser._id,
        type: 'INFO',
        title: 'Shift Swap Pending',
        message: 'Your shift exchange proposal was sent to Nurse Seetha.',
        isRead: false
      });
    }

    console.log('Notifications populated.');
    console.log('\n=============================================');
    console.log('SAMPLE DATA SEEDED SUCCESSFULLY FOR ALL SECTIONS!');
    console.log('=============================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exit(1);
  }
};

seedSampleData();

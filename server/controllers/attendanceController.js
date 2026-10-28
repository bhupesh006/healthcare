const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const Shift = require('../models/Shift');
const { parseTimeOnDate } = require('../services/schedulingService');

// @desc    Get attendance records with filtering
// @route   GET /api/attendance
const getAttendance = async (req, res) => {
  try {
    const { date, staffId, departmentId, status } = req.query;
    
    // Parse target date (defaults to today)
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    if (staffId) {
      query.staff = staffId;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate({
        path: 'staff',
        select: 'fullName role employeeId department phone email',
        populate: { path: 'department', select: 'name code' }
      })
      .populate({
        path: 'shift',
        select: 'shiftType startTime endTime requiredStaff location department',
        populate: { path: 'department', select: 'name code' }
      })
      .sort({ clockIn: -1, createdAt: -1 });

    // Filter by department if requested
    let filteredRecords = records;
    if (departmentId && departmentId !== 'ALL') {
      filteredRecords = records.filter(r => {
        const staffDeptId = r.staff?.department?._id?.toString() || r.staff?.department?.toString();
        const shiftDeptId = r.shift?.department?._id?.toString() || r.shift?.department?.toString();
        return staffDeptId === departmentId || shiftDeptId === departmentId;
      });
    }

    res.json(filteredRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance summary stats for a date
// @route   GET /api/attendance/stats
const getAttendanceStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Also count scheduled shifts for today to know expected staff
    const scheduledShifts = await Shift.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const assignedStaffSet = new Set();
    scheduledShifts.forEach(shift => {
      shift.assignedStaff.forEach(s => assignedStaffSet.add(s.toString()));
    });

    const expectedCount = assignedStaffSet.size;
    const onDuty = records.filter(r => r.status === 'ON_DUTY' || (r.clockIn && !r.clockOut)).length;
    const completed = records.filter(r => r.clockIn && r.clockOut).length;
    const late = records.filter(r => r.status === 'LATE').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const onLeave = records.filter(r => r.status === 'LEAVE').length;

    // Total hours worked today
    const totalHoursToday = records.reduce((acc, r) => acc + (r.totalHours || 0), 0);

    res.json({
      expectedCount,
      totalLogged: records.length,
      onDuty,
      completed,
      late,
      absent,
      onLeave,
      totalHoursToday: Math.round(totalHoursToday * 10) / 10,
      complianceRate: expectedCount > 0 ? Math.min(100, Math.round(((onDuty + completed) / expectedCount) * 100)) : 100
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Staff Clock In
// @route   POST /api/attendance/clock-in
const clockIn = async (req, res) => {
  try {
    const { staffId, shiftId, notes, location } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required to clock in' });
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if staff already has an open clock-in today
    let record = await Attendance.findOne({
      staff: staffId,
      date: { $gte: startOfDay, $lte: endOfDay },
      clockIn: { $exists: true },
      clockOut: { $exists: false }
    });

    if (record) {
      return res.status(400).json({ message: 'Staff is already clocked in today', record });
    }

    // Find shift if not provided
    let assignedShift = null;
    if (shiftId) {
      assignedShift = await Shift.findById(shiftId);
    } else {
      assignedShift = await Shift.findOne({
        assignedStaff: staffId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });
    }

    // Determine status (check if late)
    let status = 'ON_DUTY';
    if (assignedShift && assignedShift.startTime) {
      const shiftStartTime = parseTimeOnDate(today, assignedShift.startTime);
      // If clocked in more than 15 minutes after shift start
      if (today.getTime() > shiftStartTime.getTime() + 15 * 60 * 1000) {
        status = 'LATE';
      }
    }

    record = new Attendance({
      staff: staffId,
      shift: assignedShift ? assignedShift._id : null,
      date: today,
      clockIn: today,
      status,
      location: location || 'Main Hospital Checkpoint',
      notes
    });

    await record.save();
    await record.populate({
      path: 'staff',
      select: 'fullName role employeeId department',
      populate: { path: 'department', select: 'name code' }
    });
    await record.populate({
      path: 'shift',
      select: 'shiftType startTime endTime department',
      populate: { path: 'department', select: 'name code' }
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Staff Clock Out
// @route   POST /api/attendance/clock-out
const clockOut = async (req, res) => {
  try {
    const { attendanceId, staffId, notes, biometricVerified, biometricTerminalId, location } = req.body;

    let record = null;
    if (attendanceId) {
      record = await Attendance.findById(attendanceId);
    } else if (staffId) {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      record = await Attendance.findOne({
        staff: staffId,
        date: { $gte: startOfDay, $lte: endOfDay },
        clockIn: { $exists: true },
        clockOut: { $exists: false }
      });
    }

    if (!record) {
      return res.status(404).json({ message: 'No active clock-in session found to clock out' });
    }

    const now = new Date();
    record.clockOut = now;
    
    // Calculate total hours
    const durationMs = now.getTime() - new Date(record.clockIn).getTime();
    const hours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
    record.totalHours = Math.max(0.1, hours);

    // If status was ON_DUTY, set to PRESENT
    if (record.status === 'ON_DUTY') {
      record.status = 'PRESENT';
    }
    
    // Biometric metadata
    record.biometricVerified = biometricVerified !== undefined ? biometricVerified : true;
    if (biometricTerminalId) {
      record.biometricTerminalId = biometricTerminalId;
    }
    if (location) {
      record.location = location;
    }

    if (notes) {
      record.notes = record.notes ? `${record.notes} | ${notes}` : notes;
    }

    await record.save();
    await record.populate({
      path: 'staff',
      select: 'fullName role employeeId department',
      populate: { path: 'department', select: 'name code' }
    });
    await record.populate({
      path: 'shift',
      select: 'shiftType startTime endTime department',
      populate: { path: 'department', select: 'name code' }
    });

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manual attendance creation / update by Manager
// @route   POST /api/attendance/manual
const markManualAttendance = async (req, res) => {
  try {
    const { staffId, shiftId, date, clockIn, clockOut, status, notes, location } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    const attDate = date ? new Date(date) : new Date();
    const clockInDate = clockIn ? new Date(clockIn) : new Date(attDate.setHours(8, 0, 0, 0));
    let clockOutDate = null;
    let totalHours = null;

    if (clockOut) {
      clockOutDate = new Date(clockOut);
      const diffMs = clockOutDate.getTime() - clockInDate.getTime();
      totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }

    const newRecord = new Attendance({
      staff: staffId,
      shift: shiftId || null,
      date: attDate,
      clockIn: clockInDate,
      clockOut: clockOutDate,
      totalHours: totalHours || (status === 'PRESENT' ? 8 : 0),
      status: status || 'PRESENT',
      notes: notes || 'Manually logged by clinical supervisor',
      location: location || 'Hospital Terminal Override'
    });

    await newRecord.save();
    await newRecord.populate({
      path: 'staff',
      select: 'fullName role employeeId department',
      populate: { path: 'department', select: 'name code' }
    });
    await newRecord.populate({
      path: 'shift',
      select: 'shiftType startTime endTime department',
      populate: { path: 'department', select: 'name code' }
    });

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendance,
  getAttendanceStats,
  clockIn,
  clockOut,
  markManualAttendance
};

const Staff = require('../models/Staff');
const Shift = require('../models/Shift');
const Leave = require('../models/Leave');
const Compliance = require('../models/Compliance');
const Department = require('../models/Department');

/**
 * Safely parses time string (e.g., '08:00 AM', '14:00', '4:30 PM') on a given base date.
 */
const parseTimeOnDate = (baseDate, timeStr) => {
  const d = new Date(baseDate);
  if (!timeStr) return d;

  const str = String(timeStr).trim();
  // 12-hour format e.g. "08:00 AM", "04:00 PM"
  const match12 = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const seconds = match12[3] ? parseInt(match12[3], 10) : 0;
    const meridian = match12[4] ? match12[4].toUpperCase() : null;

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    d.setHours(hours, minutes, seconds, 0);
    return d;
  }

  // 24-hour format e.g. "14:00", "08:00"
  const match24 = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    d.setHours(parseInt(match24[1], 10), parseInt(match24[2], 10), match24[3] ? parseInt(match24[3], 10) : 0, 0);
    return d;
  }

  // Direct date parse
  const direct = new Date(str);
  if (!isNaN(direct.getTime())) {
    return direct;
  }

  return d;
};

/**
 * Smart recommendation engine to find eligible staff for a given shift.
 * Evaluates: Department, Availability, Existing Schedule, Leave, Role, Certification.
 */
const findEligibleStaff = async (shiftId) => {
  try {
    const shift = await Shift.findById(shiftId).populate('department');
    if (!shift) {
      throw new Error('Shift not found');
    }

    // 1. Fetch all active staff with populated department
    const allStaff = await Staff.find({ status: 'ACTIVE' }).populate('department');
    
    const eligibleStaff = [];
    const ineligibleStaff = [];

    // Parse shift dates safely
    let shiftStart = parseTimeOnDate(shift.date, shift.startTime);
    let shiftEnd = parseTimeOnDate(shift.date, shift.endTime);
    if (shiftEnd <= shiftStart) {
      shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    const shiftDeptId = (shift.department?._id || shift.department)?.toString();

    for (let staff of allStaff) {
      let isEligible = true;
      let reasons = [];

      // Check 1: Already Assigned to this Shift
      const isAlreadyAssigned = shift.assignedStaff && shift.assignedStaff.some(
        sId => (sId._id || sId).toString() === staff._id.toString()
      );
      if (isAlreadyAssigned) {
        isEligible = false;
        reasons.push('Already assigned to this shift');
      }

      // Check 2: Department Match
      const staffDeptId = (staff.department?._id || staff.department)?.toString();
      if (shiftDeptId && staffDeptId && shiftDeptId !== staffDeptId) {
        isEligible = false;
        const staffDeptName = staff.department?.name || 'Other Department';
        const shiftDeptName = shift.department?.name || shift.department?.code || 'Shift Department';
        reasons.push(`Department mismatch: Belongs to ${staffDeptName} (Shift is ${shiftDeptName})`);
      }

      // Check 3: Role Requirement
      if (shift.requiredRoles && shift.requiredRoles.length > 0) {
        if (!shift.requiredRoles.includes(staff.role)) {
          isEligible = false;
          reasons.push(`Role mismatch: Requires ${shift.requiredRoles.join(' or ')}`);
        }
      }

      // Check 4: Leave Conflict
      const overlappingLeave = await Leave.findOne({
        staff: staff._id,
        status: 'APPROVED',
        startDate: { $lte: shiftEnd },
        endDate: { $gte: shiftStart }
      });

      if (overlappingLeave) {
        isEligible = false;
        reasons.push('Approved leave during this shift window');
      }

      // Check 5: Existing Shift Conflict on same date
      const shiftDateStart = new Date(shift.date);
      shiftDateStart.setHours(0, 0, 0, 0);
      const shiftDateEnd = new Date(shift.date);
      shiftDateEnd.setHours(23, 59, 59, 999);

      const existingShifts = await Shift.find({
        assignedStaff: staff._id,
        date: { $gte: shiftDateStart, $lte: shiftDateEnd },
        _id: { $ne: shift._id }
      });

      if (existingShifts.length > 0) {
        isEligible = false;
        reasons.push(`Existing shift conflict on this date (${existingShifts.map(s => s.shiftType).join(', ')})`);
      }

      // Check 6: Compliance & Certifications
      if (shift.requiredCertifications && shift.requiredCertifications.length > 0) {
        const compliances = await Compliance.find({
          staff: staff._id,
          requirement: { $in: shift.requiredCertifications },
          status: 'VALID'
        });

        const validCertNames = compliances.map(c => c.requirement);
        const missingCerts = shift.requiredCertifications.filter(req => !validCertNames.includes(req));

        if (missingCerts.length > 0) {
          isEligible = false;
          reasons.push(`Missing or expired certification: ${missingCerts.join(', ')}`);
        }
      }

      // Check 7: Availability (Basic Day Check)
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = days[new Date(shift.date).getDay()];
      if (staff.availability && staff.availability[dayOfWeek] === false) {
        isEligible = false;
        reasons.push(`Marked as unavailable on ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}s`);
      }

      // Categorization
      if (isEligible) {
        eligibleStaff.push(staff);
      } else {
        ineligibleStaff.push({
          staff,
          reasons
        });
      }
    }

    return {
      shift,
      eligibleStaff,
      ineligibleStaff
    };
  } catch (error) {
    throw new Error(`Scheduling Service Error: ${error.message}`);
  }
};

module.exports = {
  findEligibleStaff,
  parseTimeOnDate,
};

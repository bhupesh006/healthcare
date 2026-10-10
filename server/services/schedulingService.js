const Staff = require('../models/Staff');
const Shift = require('../models/Shift');
const Leave = require('../models/Leave');
const Compliance = require('../models/Compliance');

/**
 * Smart recommendation engine to find eligible staff for a given shift.
 * Evaluates: Availability, Existing Schedule, Leave, Role, Certification.
 */
const findEligibleStaff = async (shiftId) => {
  try {
    const shift = await Shift.findById(shiftId).populate('department');
    if (!shift) {
      throw new Error('Shift not found');
    }

    // 1. Fetch all active staff
    const allStaff = await Staff.find({ status: 'ACTIVE' });
    
    const eligibleStaff = [];
    const ineligibleStaff = [];

    // Parse shift dates
    const shiftStart = new Date(`${shift.date.toISOString().split('T')[0]}T${shift.startTime}`);
    // Naive end time parsing (assuming same day for now, can be improved for overnight shifts)
    const shiftEnd = new Date(`${shift.date.toISOString().split('T')[0]}T${shift.endTime}`);

    for (let staff of allStaff) {
      let isEligible = true;
      let reasons = [];

      // Check 1: Role Requirement
      if (shift.requiredRoles && shift.requiredRoles.length > 0) {
        if (!shift.requiredRoles.includes(staff.role)) {
          isEligible = false;
          reasons.push(`Role mismatch: Requires ${shift.requiredRoles.join(' or ')}`);
        }
      }

      // Check 2: Leave Conflict
      const overlappingLeave = await Leave.findOne({
        staff: staff._id,
        status: 'APPROVED',
        startDate: { $lte: shiftEnd },
        endDate: { $gte: shiftStart }
      });

      if (overlappingLeave) {
        isEligible = false;
        reasons.push('Approved leave during this shift');
      }

      // Check 3: Existing Shift Conflict (Overlapping shifts)
      const existingShifts = await Shift.find({
        assignedStaff: staff._id,
        date: shift.date, // Simplifying to same day for demo
        _id: { $ne: shift._id }
      });

      if (existingShifts.length > 0) {
        // More granular time overlap checking would happen here
        isEligible = false;
        reasons.push('Existing shift conflict on this date');
      }

      // Check 4: Compliance & Certifications
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

      // Check 5: Availability (Basic Day Check)
      const dayOfWeek = shift.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (staff.availability && staff.availability[dayOfWeek] === false) {
        isEligible = false;
        reasons.push(`Marked as unavailable on ${dayOfWeek}s`);
      }

      // Final Categorization
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
};

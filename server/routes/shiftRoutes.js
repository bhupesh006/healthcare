const express = require('express');
const router = express.Router();
const { getShifts, createShift, getEligibleStaff, assignStaff, applyForShift } = require('../controllers/shiftController');

// In a real app, you would add auth middleware here
// const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getShifts)
  .post(createShift);

router.get('/:id/eligible-staff', getEligibleStaff);
router.post('/:id/assign', assignStaff);
router.post('/:id/apply', applyForShift);

module.exports = router;

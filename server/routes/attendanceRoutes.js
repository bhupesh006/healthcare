const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceStats,
  clockIn,
  clockOut,
  markManualAttendance
} = require('../controllers/attendanceController');

router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/manual', markManualAttendance);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, updateLeaveStatus, checkLeaveImpact } = require('../controllers/leaveController');

router.route('/')
  .get(getLeaves)
  .post(applyLeave);

router.put('/:id/status', updateLeaveStatus);
router.get('/:id/impact', checkLeaveImpact);

module.exports = router;

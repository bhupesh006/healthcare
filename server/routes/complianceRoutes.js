const express = require('express');
const router = express.Router();
const { getComplianceRecords, getComplianceStats, createComplianceRecord, verifyCompliance } = require('../controllers/complianceController');

router.get('/stats', getComplianceStats);

router.route('/')
  .get(getComplianceRecords)
  .post(createComplianceRecord);

router.put('/:id/verify', verifyCompliance);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getStaff, getStaffById } = require('../controllers/staffController');

router.route('/')
  .get(getStaff);

router.route('/:id')
  .get(getStaffById);

module.exports = router;

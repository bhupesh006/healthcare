const express = require('express');
const router = express.Router();
const {
  getStaff,
  getStaffById,
  createStaff,
  deleteStaff
} = require('../controllers/staffController');

router.route('/')
  .get(getStaff)
  .post(createStaff);

router.route('/:id')
  .get(getStaffById)
  .delete(deleteStaff);

module.exports = router;

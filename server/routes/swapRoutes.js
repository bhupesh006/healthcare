const express = require('express');
const router = express.Router();
const { getSwaps, createSwap, updateSwapStatus } = require('../controllers/swapController');

router.route('/')
  .get(getSwaps)
  .post(createSwap);

router.put('/:id/status', updateSwapStatus);

module.exports = router;

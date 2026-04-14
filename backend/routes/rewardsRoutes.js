const express = require('express');
const router = express.Router();
const { getMyRewards, saveBankDetails, withdrawRewards } = require('../controllers/rewardsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyRewards);
router.post('/bank', protect, saveBankDetails);
router.post('/withdraw', protect, withdrawRewards);

module.exports = router;
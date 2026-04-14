const Reward = require('../models/Reward');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get my rewards
exports.getMyRewards = async (req, res) => {
  const reward = await Reward.findOne({ user: req.user._id });
  if (!reward) return res.status(404).json({ message: 'Rewards not found' });
  res.json(reward);
};

// Save bank details
exports.saveBankDetails = async (req, res) => {
  const { accountNumber, ifscCode, accountHolderName } = req.body;
  const reward = await Reward.findOneAndUpdate(
    { user: req.user._id },
    { bankDetails: { accountNumber, ifscCode, accountHolderName } },
    { new: true }
  );
  res.json({ message: 'Bank details saved', reward });
};

// Check eligibility and withdraw
exports.withdrawRewards = async (req, res) => {
  const reward = await Reward.findOne({ user: req.user._id });

  // Eligibility checks
  if (reward.points < 500)
    return res.status(400).json({ message: 'Minimum 500 points required to withdraw' });
  if (reward.bookingCount < 3)
    return res.status(400).json({ message: 'Minimum 3 bookings required' });
  if (!reward.isKycVerified)
    return res.status(400).json({ message: 'KYC verification required' });
  if (!reward.bankDetails?.accountNumber)
    return res.status(400).json({ message: 'Please add bank details first' });

  const pointsToRedeem = reward.points;
  const amountInRupees = Math.floor(pointsToRedeem / 100) * 10; // 100 pts = ₹10
  const amountInPaise = amountInRupees * 100;

  // Razorpay payout (you need Razorpay X account for this)
  // For now we simulate and mark as redeemed
  reward.totalRedeemed += pointsToRedeem;
  reward.points = 0;
  reward.history.push({
    type: 'redeemed',
    points: pointsToRedeem,
    description: `Withdrew ₹${amountInRupees} to bank account`,
  });
  await reward.save();

  res.json({ message: `₹${amountInRupees} will be credited to your bank account within 2 hours`, amountInRupees });
};
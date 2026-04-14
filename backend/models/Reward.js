const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalRedeemed: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
  isKycVerified: { type: Boolean, default: false },
  history: [{
    type: { type: String, enum: ['earned', 'redeemed'] },
    points: Number,
    description: String,
    date: { type: Date, default: Date.now }
  }],
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
const User = require('../models/User');
const Reward = require('../models/Reward');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password, phone });

  // Create a rewards account for every new user automatically
  await Reward.create({ user: user._id });

  res.status(201).json({
    _id: user._id, name: user.name, email: user.email,
    token: generateToken(user._id),
  });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id, name: user.name, email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  res.json(req.user);
};
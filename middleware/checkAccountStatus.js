// middleware/checkAccountStatus.js

const User = require('../models/user');

const checkAccountStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.accountStatus !== 'active') {
      return res.status(403).json({ message: 'Your account is not active. Please confirm your email.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = checkAccountStatus;

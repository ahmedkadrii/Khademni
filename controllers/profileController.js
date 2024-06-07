const User = require('../models/user');
const Enterprise = require('../models/enterprise');

exports.getProfile = async (req, res) => {
    try {
      const { username } = req.params;
      // Find user or enterprise based on username
      let profile = await User.findOne({ username }).select('-password');
      if (!profile) profile = await Enterprise.findOne({ username }).select('-password');
  
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
  
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
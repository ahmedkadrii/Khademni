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
  

// @DESC: Uploading CV for regular Users/Candidates
// @METHOD: PUT  
// @ROUTE: /upload-cv  @profileRoutes

exports.uploadCV = async (req, res) => {
  const userId = req.session.userId; // Get userId from session

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update the user's CV file path in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save the file path to the user's profile
    user.cv = req.file.path;
    await user.save();

    res.status(200).json({ message: 'CV uploaded successfully', filePath: req.file.path });
  } catch (error) {
    console.error('Error uploading CV:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





// @DESC: Uploading Logo for regular Users/Candidates
// @METHOD: PUT  
// @ROUTE: /:username/upload-logo  @profileRoutes

exports.uploadLogo = async (req, res) => {
  const { username } = req.params;

  try {
    // Check if the user performing the update is the same as the user whose profile is being updated
    if (req.session.username !== username) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to update this profile' });
    }

    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find the enterprise or user by username
    let enterprise = await Enterprise.findOne({ username });
    let user = await User.findOne({ username });

    if (!enterprise && !user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Set the logo field to the file path
    if (enterprise) {
      enterprise.logo = `/imgUploads/${req.file.filename}`;
      await enterprise.save();
      res.status(200).json({ message: 'Logo uploaded successfully', logo: enterprise.logo });
    } else if (user) {
      user.logo = `/imgUploads/${req.file.filename}`;
      await user.save();
      res.status(200).json({ message: 'Logo uploaded successfully', logo: user.logo });
    }
  } catch (err) {
    console.error('Error uploading logo:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

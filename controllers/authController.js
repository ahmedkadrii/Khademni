// controllers/authController.js

const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Enterprise = require('../models/enterprise');
const Admin = require('../models/admin');
const upload = require('../middleware/fileUploadMiddleware'); // Import the file upload middleware
const TempEnterprise = require('../models/tempEnterprise');


// controllers/authController.js

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Check if the account is marked for deletion
      if (user.markedForDeletion) {
        const now = new Date();
        const deletionTime = new Date(user.deletionRequestedAt);
        const hoursSinceRequest = (now - deletionTime) / (1000 * 60);

        if (hoursSinceRequest < 1) {
          user.markedForDeletion = false;
          user.deletionRequestedAt = null;
          await user.save();
        } else {
          return res.status(403).json({ message: 'Account is scheduled for deletion' });
        }
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Authentication successful
      req.session.userId = user._id;
      req.session.userRole = user.role;
      req.session.username = user.username;

      // Customize response for user
      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        address: user.address,
        name: user.name
      };

      return res.status(200).json({ message: 'Login successful', userData });
    }

    // Check if enterprise exists
    let enterprise = await Enterprise.findOne({ email });
    if (enterprise) {
      // Check if the account is marked for deletion
      if (enterprise.markedForDeletion) {
        const now = new Date();
        const deletionTime = new Date(enterprise.deletionRequestedAt);
        const hoursSinceRequest = (now - deletionTime) / (1000 * 60);

        if (hoursSinceRequest < 1) {
          enterprise.markedForDeletion = false;
          enterprise.deletionRequestedAt = null;
          await enterprise.save();
        } else {
          return res.status(403).json({ message: 'Account is scheduled for deletion' });
        }
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, enterprise.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Authentication successful
      req.session.userId = enterprise._id;
      req.session.userRole = 'enterprise';
      req.session.username = enterprise.username;

      // Customize response for enterprise
      const userData = {
        id: enterprise._id,
        username: enterprise.username,
        name: enterprise.name,
        email: enterprise.email,
        bio: enterprise.bio,
        role: enterprise.role,
        address: enterprise.address
      };

      return res.status(200).json({ message: 'Login successful', userData });
    }

    // Check if enterprise is awaiting admin approval
    let tempEnterprise = await TempEnterprise.findOne({ email });
    if (tempEnterprise) {
      return res.status(400).json({ message: 'Your account is awaiting admin approval' });
    }

    // Check if admin exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Authentication successful
      req.session.userId = admin._id;
      req.session.userRole = 'admin';
      req.session.username = admin.username;

      // Customize response for admin
      const userData = {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        email: admin.email
        // Add any additional fields specific to admin here
      };

      return res.status(200).json({ message: 'Login successful', userData });
    }

    // If no user, enterprise, or admin found
    return res.status(400).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/authController.js

exports.logout = async (req, res) => {
    try {
      // Destroy session on the server-side
      req.session.destroy();
  
      // Clear cookie on the client-side
      res.clearCookie('connect.sid'); // Replace 'connect.sid' with your session cookie name
  
      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      console.error('Error in logout:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
    
// controllers/authController.js

exports.dashboard = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.userId || !req.session.userRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let user;

    // Fetch user details based on the session
    if (req.session.userRole === 'user') {
      user = await User.findById(req.session.userId);
    } else if (req.session.userRole === 'enterprise') {
      user = await Enterprise.findById(req.session.userId);
    } else if (req.session.userRole === 'admin') {
      user = await Admin.findById(req.session.userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ id: user._id, role: req.session.userRole });
  } catch (err) {
    console.error('Error in dashboard:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
  
exports.updateProfile = async (req, res) => {
  const { username } = req.params;
  const { address, bio, newUsername, name, email, logo, skills, contactEmail, phone } = req.body;

  try {
    // Check if the user performing the update is the same as the user whose profile is being updated
    if (req.session.username !== username) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to update this profile' });
    }

    // Find the user by username
    let user = await User.findOne({ username });
    let enterprise = await Enterprise.findOne({ username });

    if (!user && !enterprise) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if the new username already exists
    if (newUsername && newUsername !== username) {
      const existingUser = await User.findOne({ username: newUsername });
      const existingEnterprise = await Enterprise.findOne({ username: newUsername });
      if (existingUser || existingEnterprise) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Update user profile fields if provided in the request body
    if (user) {
      if (name) user.name = name;
      if (address) user.address = address;
      if (email) user.email = email;
      if (bio) user.bio = bio;
      if (newUsername && newUsername !== username) user.username = newUsername;
      if (skills) user.skills = skills;
      if (phone) user.phone = phone;

      if (contactEmail) user.contactEmail = contactEmail;


      await user.save();
      res.status(200).json({ message: 'Profile updated successfully' });
    }

    // Update enterprise profile fields if provided in the request body
    if (enterprise) {
      if (name) enterprise.name = name;
      if (address) enterprise.address = address;
      if (email) enterprise.email = email;
      if (bio) enterprise.bio = bio;
      if (newUsername && newUsername !== username) enterprise.username = newUsername;
      if (logo) enterprise.logo = logo;
      if (phone) enterprise.phone = phone;
      if (contactEmail) enterprise.contactEmail = contactEmail;

      await enterprise.save();
      res.status(200).json({ message: 'Profile updated successfully' });
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


  

// controllers/authController.js
exports.updateSettings = async (req, res) => {
  const userId = req.session.userId; // Get userId from session
  const { email, password } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user settings
    if (email) user.email = email;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Server-side route to check if the user is logged in
exports.checkAuthStatus = (req, res) => {
  if (req.session.userId) {
      // Assuming you have the user's role stored in req.session.userRole
      const isLoggedIn = true;
      const role = req.session.userRole; // Get user's role from session
      const username = req.session.username
      res.status(200).json({ isLoggedIn, role,username }); // Send user's role in the response
  } else {
      res.status(200).json({ isLoggedIn: false });
  }
};


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



// REQUEST ACCOUNT DELETION

exports.requestDeletion = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    // Try finding the user in the User collection
    let account = await User.findById(userId);

    // If not found in User, try finding in Enterprise
    if (!account) {
      account = await Enterprise.findById(userId);
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
    }

    account.markedForDeletion = true;
    account.deletionRequestedAt = new Date();
    await account.save();

    res.status(200).json({ message: 'Account marked for deletion' });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

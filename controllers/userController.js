// controllers/userController.js

const bcrypt = require('bcryptjs');
const User = require('../models/user');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const TempUser = require('../models/tempUser');
const Enterprise = require('../models/enterprise');
const Notification = require('../models/notification');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.signup = async (req, res) => {
  const { username, email, password, address, bio, name, logo, contactEmail,phone } = req.body;

  try {
    // Check if user already exists in the main User collection
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    let enterprise = await Enterprise.findOne({ email });
    if (enterprise) {
      return res.status(400).json({ message: 'this email already exists' });
    }

    user = await Enterprise.findOne({ username });
    if (enterprise) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if user already exists in the TempUser collection
    let tempUser = await TempUser.findOne({ email });
    if (tempUser) {
      return res.status(400).json({ message: 'Email verification is pending. Please check your email.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate confirmation token
    const token = crypto.randomBytes(32).toString('hex');

    // Store temporary user information with confirmation token
    tempUser = new TempUser({
      username,
      name,
      email,
      password: hashedPassword,
      address,
      bio,
      logo,
      phone,
      contactEmail,
      confirmationToken: token
    });

    await tempUser.save();

    // Send confirmation email
    const msg = {
      to: email,
      from: 'elevatepfe@gmail.com',
      subject: 'Email Confirmation',
      html: `Please confirm your email by clicking the following link: <a href="http://localhost:4200/confirm/${token}">confirm</a>`
    };

    await sgMail.send(msg);

    res.status(201).json({ message: 'Please check your email to confirm your account.' });
  } catch (err) {
    console.error('Error in user signup:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.confirmEmail = async (req, res) => {
  try {
    const token = req.params.token;
    console.log(`Received token: ${token}`);  // Log the received token
    const tempUser = await TempUser.findOne({ confirmationToken: token });

    if (!tempUser) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    console.log(`Temp user found: ${tempUser.email}`);  // Log the found temp user

    // Create the user account from tempUser
    const user = new User({
      username: tempUser.username,
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      address: tempUser.address,
      bio: tempUser.bio,
      logo: tempUser.logo,
      phone: tempUser.phone,
      contactEmail: tempUser.contactEmail,
      confirmed: true,
      accountStatus: 'active'
    });

    await user.save();
    await TempUser.findByIdAndDelete(tempUser._id);

    res.status(200).json({ message: 'Email confirmed. You can now log in.' });
  } catch (error) {
    console.error('Error confirming email:', error);  // Log the error details
    res.status(400).json({ message: 'Error confirming email', error: error.message });
  }
};



// PASSWORD RESET
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User with this email does not exist.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    console.log('Generated reset token:', resetToken);
    console.log('Token expiry date:', new Date(user.resetPasswordExpires));

    // Send email
    const msg = {
      to: user.email,
      from: 'elevatepfe@gmail.com',
      subject: 'Password Reset',
      html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>
             Your reset link expires in 1 hour, Please click on the following link to complete the process:<br><br>
             <a href="http://localhost:4200/reset-password/${resetToken}"> Reset Password<br><br>
             If you did not request this, please ignore this email and your password will remain unchanged.<br>`
    };

    await sgMail.send(msg);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Error in forgot password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const resetToken = req.params.resetToken;
  const { password } = req.body;

  console.log('Received reset token:', resetToken);
  console.log('Received new password:', password);

  try {
    const user = await User.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      console.log('Invalid or expired reset token:', resetToken);
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    console.log('Reset token is valid:', resetToken);

    // Hash the new password before saving
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log('Password reset successful for user:', user.email);
    res.status(200).json({ message: 'Password successfully reset.' });
  } catch (err) {
    console.error('Error in reset password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// GET ALL USERS

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


// USER INTERACTION - FOLLOWING AND UNFOLLOWING

exports.followUser = async (req, res) => {
  const { username: targetUsername } = req.params; // Username of the user/enterprise to follow
  const currentUsername = req.session.username; // Current logged-in user's/enterprise's username

  try {
    const currentUser = await User.findOne({ username: currentUsername }) || await Enterprise.findOne({ username: currentUsername });
    const userToFollow = await User.findOne({ username: targetUsername }) || await Enterprise.findOne({ username: targetUsername });

    if (!currentUser || !userToFollow) {
      console.log('User or Enterprise not found');
      return res.status(404).json({ message: 'User or Enterprise not found' });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      console.log('Already following this user or enterprise');
      return res.status(400).json({ message: 'You are already following this user or enterprise' });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    console.log(`${currentUser.username} started following ${userToFollow.username} `);

    // Create a notification for the user being followed
    console.log('Notification created for following user');
    const notification = new Notification({
      recipient: userToFollow._id,
      recipientModel: userToFollow.constructor.modelName,
      sender: currentUser._id,
      senderModel: currentUser.constructor.modelName,
      type: 'follow',
      content: `${currentUser.username} started following you.`,
      createdAt: new Date()
    });
    await notification.save();

    return res.status(200).json({ message: 'User or Enterprise followed successfully' });
  } catch (err) {
    console.error('Error following user or enterprise:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  const { username: targetUsername } = req.params;
  const currentUsername = req.session.username;

  try {
    const currentUser = await User.findOne({ username: currentUsername }) || await Enterprise.findOne({ username: currentUsername });
    const userToUnfollow = await User.findOne({ username: targetUsername }) || await Enterprise.findOne({ username: targetUsername });

    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({ message: 'User or Enterprise not found' });
    }

    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ message: 'You are not following this user or enterprise' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await userToUnfollow.save();

    return res.status(200).json({ message: 'User or Enterprise unfollowed successfully' });
  } catch (err) {
    console.error('Error unfollowing user or enterprise:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.isFollowingUser = async (req, res) => {
  try {
    const { username: targetUsername } = req.params;
    const currentUsername = req.session.username;

    // Find the target user or enterprise
    let targetUser = await User.findOne({ username: targetUsername }) || await Enterprise.findOne({ username: targetUsername });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the current user or enterprise
    let currentUser = await User.findOne({ username: currentUsername }) || await Enterprise.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    // Check if the current user is following the target user/enterprise
    const isFollowing = currentUser.following.includes(targetUser._id);

    res.json({ isFollowing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

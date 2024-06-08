const Admin = require('../models/admin');
const Job = require('../models/job');
const JobApplication = require('../models/jobApplication');
const User = require('../models/user');
const Report = require('../models/report'); // Import the Report model

const Enterprise = require('../models/enterprise');
const TempEnterprise = require('../models/tempEnterprise');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');







// Admin signup (for testing purposes)
exports.signupAdmin = async (req, res) => {
  const {email, password } = req.body;
  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};















// @DESC: Approve Enterprise Sign up request
// @METHOD: POST 
exports.approveEnterprise = async (req, res) => {
    const { enterpriseId } = req.body;
    try {
      const tempEnterprise = await TempEnterprise.findById(enterpriseId);
      if (!tempEnterprise) {
        console.error('Enterprise not found');
        return res.status(404).json({ message: 'Enterprise not found' });
      }
  
      // Create new enterprise from tempEnterprise
      const newEnterprise = new Enterprise({
        username: tempEnterprise.username,
        email: tempEnterprise.email,
        password: tempEnterprise.password,
        name: tempEnterprise.name,
        bio: tempEnterprise.bio,
        address: tempEnterprise.address,
        logo: tempEnterprise.logo,
        phone: tempEnterprise.phone,
        followers: tempEnterprise.followers,
        following: tempEnterprise.following,
        approved: true
      });
  
      await newEnterprise.save();
      await TempEnterprise.findByIdAndDelete(tempEnterprise._id);
  
      // Send email notification
      const transporter = nodemailer.createTransport({
        host: 'smtp.mailersend.net',
        port: 587,
        auth: {
          user: 'MS_qZIZ1U@trial-z3m5jgrq61zldpyo.mlsender.net',
          pass: 'rehVWZxathTjFAl5'
        }
      });
  
      const mailOptions = {
        from: 'MS_qZIZ1U@trial-z3m5jgrq61zldpyo.mlsender.net',
        to: tempEnterprise.email,
        subject: 'Enterprise Approval Confirmation',
        text: `Dear ${tempEnterprise.username},\n\nYour enterprise has been approved successfully! You can now access all the features of our platform.\n\nThank you for joining us!\n\nBest regards,\nKhademni`
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
  
      res.json({ message: 'Enterprise approved and added successfully' });
    } catch (error) {
      console.error('Error in approveEnterprise:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
      
  // Reject enterprise
  exports.rejectEnterprise = async (req, res) => {
    const { enterpriseId } = req.body;
    try {
      const tempEnterprise = await TempEnterprise.findById(enterpriseId);
      if (!tempEnterprise) return res.status(404).json({ message: 'Enterprise not found' });
  
      await TempEnterprise.findByIdAndDelete(tempEnterprise._id);
      res.json({ message: 'Enterprise rejected and removed successfully' });
    } catch (error) {
      res.status (500).json({ message: 'Server error' });
    }
  };
  

  exports.getPendingEnterprises = async (req, res) => {
    try {
      const pendingEnterprises = await TempEnterprise.find();
      res.json(pendingEnterprises);
    } catch (error) {
      console.error('Error in getPendingEnterprises:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  exports.deleteEnterpriseAccount = async (req, res) => {
    const enterpriseId = req.params.id;
  
    try {
      // Find and delete the enterprise
      const enterprise = await Enterprise.findByIdAndDelete(enterpriseId);
      if (!enterprise) {
        return res.status(404).json({ message: 'Enterprise account not found' });
      }
  
      // Delete related jobs
      await Job.deleteMany({ createdBy: enterpriseId });
  

      await Report.deleteMany({
        $or: [
          { reported: enterpriseId, reportedType: 'Enterprise' },
          { reportedBy: enterpriseId, reportedByType: 'Enterprise' }
        ]
      });
  

      res.status(200).json({ message: 'Enterprise account and associated jobs deleted successfully' });
    } catch (error) {
      console.error('Error deleting enterprise account:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
    

  exports.deleteUserAccount = async (req, res) => {
    const userId = req.params.id;
  
    try {
      // Find and delete the user
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ message: 'User account not found' });
      }
  
      // Delete related job applications
      await JobApplication.deleteMany({ userId: userId });


      await Report.deleteMany({
        $or: [
          { reported: userId, reportedType: 'User' },
          { reportedBy: userId, reportedByType: 'User' }
        ]
      });

  
      res.status(200).json({ message: 'User account and associated job applications deleted successfully' });
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  const ContactMessage = require('../models/contactMessage');

// Get all contact messages
exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ date: -1 }); // Sort by date, newest first
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Handle contact form submissions
exports.createContactMessage = async (req, res) => {
  const { name, subject, email, message } = req.body;

  try {
    const contactMessage = new ContactMessage({ name, subject, email, message });
    await contactMessage.save();

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Send email reply to contact message
exports.sendReplyEmail = async (req, res) => {
  const { email, subject, message } = req.body;

  // Configure the transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    auth: {
      user: 'MS_qZIZ1U@trial-z3m5jgrq61zldpyo.mlsender.net',
      pass: 'rehVWZxathTjFAl5'
    }
  });

  const mailOptions = {
    from: 'MS_qZIZ1U@trial-z3m5jgrq61zldpyo.mlsender.net',
    to: email,
    subject: subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



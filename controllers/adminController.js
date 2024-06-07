const Admin = require('../models/admin');
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
  
      res.status(200).json({ message: 'Enterprise account and associated jobs deleted successfully' });
    } catch (error) {
      console.error('Error deleting enterprise account:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
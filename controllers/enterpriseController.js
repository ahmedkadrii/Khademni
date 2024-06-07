const bcrypt = require('bcryptjs');
const Enterprise = require('../models/enterprise');
const TempEnterprise = require('../models/tempEnterprise');
const Job = require('../models/job');
const User = require('../models/user');


// Enterprise signup
exports.signupEnterprise = async (req, res) => {

  const { username, email, password, name, bio, address, logo, phone } = req.body;
  try {
    // Check if email already exists
    let enterprise = await TempEnterprise.findOne({ email });
    if (enterprise) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    } 
    
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists' });
    }





    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create temp enterprise
    const newTempEnterprise = new TempEnterprise({
      username,
      email,
      password: hashedPassword,
      name,
      bio,
      address,
      logo,
      phone,
      businessDocument: req.file.path // Save the path to the uploaded document
    });

    await newTempEnterprise.save();
    res.status(201).json({ message: 'Signup successful, awaiting admin approval. \n\n an Admin will get back to you within the next 24 hours!' });
  } catch (error) {
    console.error(error);  // Log the error to see what went wrong
    res.status(500).json({ message: 'Server error' });
  }
};


// GET ALL ENTERPRISES
exports.getAllEnterprises = async (req, res) => {
  try {
    const enterprises = await Enterprise.find();
    res.status(200).json(enterprises);
  } catch (error) {
    console.error('Error fetching enterprises:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



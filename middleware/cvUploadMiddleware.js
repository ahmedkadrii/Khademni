const multer = require('multer');
const path = require('path');
const User = require('../models/user'); // Import the User model

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: async function (req, file, cb) {
    try {
      const userId = req.session.userId; // Get userId from session
      const user = await User.findById(userId);
      if (!user) {
        return cb(new Error('User not found'));
      }

      const userName = user.name.replace(/\s+/g, '_'); // Replace spaces with underscores
      const ext = path.extname(file.originalname);
      const fileName = `${userName}_CV${ext}`;
      
      cb(null, fileName);
    } catch (error) {
      cb(error);
    }
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only PDF, DOC, or DOCX files are allowed!');
  }
}

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1 MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('cv');

module.exports = upload;

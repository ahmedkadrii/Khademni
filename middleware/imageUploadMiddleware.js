const multer = require('multer');
const path = require('path');

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'imgUploads/'); // Adjust the destination folder as needed
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const imgUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = imgUpload;

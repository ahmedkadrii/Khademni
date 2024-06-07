// uploadMiddleware.js
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'businessdocs/'); // specify the directory where you want to store the files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // set the file name
  }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
      }
    }
  });
  
// Export the middleware for use in routes
module.exports = {
  uploadSingle: upload.single('businessDocument')
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', true); // Trust the proxy headers

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(session({
  sameSite: true,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Set up Socket.io instance in the app
app.set('socketio', io);

// Import Routes
const jobRoutes = require('./routes/jobRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');
const deletionJob = require('./schedule/deletionJob');
const reportRoutes = require('./routes/reportRoutes');


// Use Routes
app.use('/api/user', userRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/report', reportRoutes);


// Serve static files from the 'uploads' directory
app.use('/imgUploads', express.static(path.join(__dirname, 'imgUploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/businessdocs', express.static(path.join(__dirname, 'businessdocs')));

app.use('/api', postRoutes);

// Socket.io configuration
io.on('connection', (socket) => {
  // console.log('a user connected');

  socket.on('sendMessage', (message) => {
    // console.log('Message received:', message);
    // No need to handle message saving here, it's done in the controller
  });

  socket.on('disconnect', () => {
    // console.log('user disconnected');
  });
});

deletionJob(); // Start the deletion job

// Starting the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

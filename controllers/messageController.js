const Message = require('../models/message');
const User = require('../models/user');
const Admin = require('../models/admin');
const Enterprise = require('../models/enterprise');

const models = [User, Admin, Enterprise];

// Helper function to get user details based on ID
const getUserDetails = async (userId) => {
    for (const model of models) {
        const user = await model.findById(userId).select('username logo');
        if (user) {
            return user;
        }
    }
    throw new Error('User not found');
};

// Pagination helper function
const paginate = (query, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    return query.skip(offset).limit(limit);
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.session.userId; // Get sender ID from session
        const { receiverId, content } = req.body;

        const sender = await getUserDetails(senderId);
        const receiver = await getUserDetails(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content
        });

        await message.save();

        const savedMessage = {
            content: message.content,
            timestamp: message.timestamp,
            senderUsername: sender.username,
            receiverUsername: receiver.username
        };

        // Emit the saved message to all connected clients via Socket.io
        const io = req.app.get('socketio'); // Get the Socket.io instance from the app
        io.emit('receiveMessage', savedMessage);

        res.status(201).json({
            message: 'Message sent successfully',
            data: savedMessage
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get conversations for logged-in user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.session.userId; // Get logged-in user ID from session

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).sort({ timestamp: -1 });

        const conversations = {};

        for (let message of messages) {
            const otherUserId = message.sender.toString() === userId ? message.receiver : message.sender;
            if (!conversations[otherUserId]) {
                const otherUser = await getUserDetails(otherUserId);
                const unreadCount = await Message.countDocuments({
                    sender: otherUserId,
                    receiver: userId,
                    read: false
                });

                conversations[otherUserId] = {
                    userId: otherUser._id,
                    username: otherUser.username,
                    logo: otherUser.logo,
                    unreadCount,
                    messages: []
                };
            }

            const sender = await getUserDetails(message.sender);
            const receiver = await getUserDetails(message.receiver);

            conversations[otherUserId].messages.push({
                content: message.content,
                timestamp: message.timestamp,
                senderUsername: sender.username,
                receiverUsername: receiver.username
            });
        }

        res.status(200).json({ data: conversations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get messages between the logged-in user and another user with pagination
exports.getMessages = async (req, res) => {
    try {
        const userId1 = req.session.userId; // Get logged-in user ID from session
        const { userId2 } = req.params;
        const { page = 1, limit = 10 } = req.query; // Get pagination parameters from query string

        const messagesQuery = Message.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        }).sort({ timestamp: -1 });

        const totalMessages = await Message.countDocuments({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        });

        const paginatedMessages = await paginate(messagesQuery, { page: Number(page), limit: Number(limit) });

        const user1 = await getUserDetails(userId1);
        const user2 = await getUserDetails(userId2);

        // Mark messages as read
        await Message.updateMany(
            {
                sender: userId2,
                receiver: userId1,
                read: false
            },
            { read: true }
        );

        const formattedMessages = paginatedMessages.reverse().map(message => ({
            content: message.content,
            timestamp: message.timestamp,
            senderUsername: message.sender.toString() === userId1 ? user1.username : user2.username,
            receiverUsername: message.receiver.toString() === userId2 ? user2.username : user1.username
        }));

        res.status(200).json({
            messages: formattedMessages,
            pagination: {
                total: totalMessages,
                page: Number(page),
                limit: Number(limit)
            },
            user1: { username: user1.username },
            user2: { username: user2.username }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

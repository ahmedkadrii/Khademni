const User = require('../models/user');
const Enterprise = require('../models/enterprise');
const Report = require('../models/report');

const models = [User, Enterprise];

// Helper function to get user details based on ID
const getUserDetails = async (userId) => {
    for (const model of models) {
        const user = await model.findById(userId).select('username');
        if (user) {
            return { user, model };
        }
    }
    throw new Error('User not found');
};

exports.reportProfile = async (req, res) => {
    try {
        const { id } = req.params; // The ID of the user or enterprise being reported
        const { reason } = req.body;
        const sessionUserId = req.session.userId; // Assuming the user's ID is stored in session

        // Check if the user is trying to report themselves
        if (id === sessionUserId) {
            return res.status(400).json({ message: 'You cannot report yourself' });
        }

        // Check if a pending report already exists
        const existingReport = await Report.findOne({
            reportedBy: sessionUserId,
            reported: id,
            status: 'pending'
        });

        if (existingReport) {
            return res.status(400).json({ message: 'You have already reported this account and it is still pending' });
        }

        // Get details of the reported entity
        const { user: reportedEntity, model: reportedModel } = await getUserDetails(id);

        // Determine the type of the reported entity
        const reportedType = reportedModel.modelName;

        // Get details of the reporting entity
        const { user: reportingEntity, model: reportingModel } = await getUserDetails(sessionUserId);

        // Determine the type of the reporting entity
        const reportedByType = reportingModel.modelName;

        // Create the report
        const report = new Report({
            reportedBy: sessionUserId,
            reportedByType,
            reported: reportedEntity._id,
            reportedType,
            reason
        });

        await report.save();

        res.status(201).json({ message: 'Profile reported successfully' });
    } catch (error) {
        console.error('Error reporting profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reportedBy', 'username')
            .populate('reported', 'username')
            .sort({ date: -1 });

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params; // The ID of the report
        const { status } = req.body; // The new status

        const report = await Report.findByIdAndUpdate(id, { status }, { new: true });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Optionally, notify the user who made the report
        const reportingUser = await User.findById(report.reportedBy);
        if (reportingUser) {
            // Send notification to the user (You can use a notification service or email)
            // For simplicity, we just log it here
            console.log(`Notification sent to ${reportingUser.username}: "We've reviewed your report, thank you for keeping our community safe!"`);
        }

        res.status(200).json({ message: 'Report status updated successfully', report });
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const cron = require('node-cron');
const User = require('../models/user');
const Enterprise = require('../models/enterprise');
const Job = require('../models/job');

const deletionJob = () => {
  cron.schedule('* * * * *', async () => { // Runs every minute for testing
    try {
      const now = new Date();

      // Check for users marked for deletion
      const users = await User.find({ markedForDeletion: true });
      for (const user of users) {
        const deletionTime = new Date(user.deletionRequestedAt);
        const minutesSinceRequest = (now - deletionTime) / (1000 * 60);

        if (minutesSinceRequest >= 1) { // 1 minute for testing
          await User.findByIdAndDelete(user._id);
          console.log(`Deleted user: ${user.username}`);
        }
      }

      // Check for enterprises marked for deletion
      const enterprises = await Enterprise.find({ markedForDeletion: true });
      for (const enterprise of enterprises) {
        const deletionTime = new Date(enterprise.deletionRequestedAt);
        const minutesSinceRequest = (now - deletionTime) / (1000 * 60);

        if (minutesSinceRequest >= 1) { // 1 minute for testing
          // Delete associated jobs first
          await Job.deleteMany({ createdBy: enterprise._id });

          // Then delete the enterprise
          await Enterprise.findByIdAndDelete(enterprise._id);
          console.log(`Deleted enterprise: ${enterprise.username}`);
        }
      }
    } catch (error) {
      console.error('Error running deletion job:', error);
    }
  });
};

module.exports = deletionJob;

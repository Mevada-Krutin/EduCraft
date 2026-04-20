const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');

const verifyAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/educraft');
        console.log('🚀 Connected to MongoDB...');

        const result = await User.updateMany(
            { isEmailVerified: { $exists: false } },
            { $set: { isEmailVerified: true } }
        );

        console.log(`✅ Fixed ${result.modifiedCount} users. They are now marked as verified.`);
        
        // Also fix any user that has it as false but should be verified (e.g. old test accounts)
        const result2 = await User.updateMany(
            { isEmailVerified: false },
            { $set: { isEmailVerified: true } }
        );
         console.log(`✅ Forced verification for ${result2.modifiedCount} more users.`);

        process.exit();
    } catch (error) {
        console.error('❌ Error fixing users:', error);
        process.exit(1);
    }
};

verifyAllUsers();

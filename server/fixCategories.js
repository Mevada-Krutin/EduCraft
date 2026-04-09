const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/educraft';

const fixCategories = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const Course = mongoose.model('Course', new mongoose.Schema({ category: String }));
        
        const result = await Course.updateMany(
            { category: { $in: [null, '', 'undefined'] } }, 
            { $set: { category: 'Computer Science' } }
        );
        
        console.log(`Updated ${result.modifiedCount} courses with missing categories.`);
        process.exit();
    } catch (error) {
        console.error('Error fixing categories:', error.message);
        process.exit(1);
    }
};

fixCategories();

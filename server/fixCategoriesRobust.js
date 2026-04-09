const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/educraft';

const fixCategories = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const Course = mongoose.model('Course', new mongoose.Schema({ category: String }));
        
        // Match null, empty string, or missing field
        const query = { 
            $or: [
                { category: { $in: [null, '', 'undefined'] } },
                { category: { $exists: false } }
            ]
        };
        
        const result = await Course.updateMany(query, { $set: { category: 'Computer Science' } });
        
        console.log(`Updated ${result.modifiedCount} courses with missing or invalid categories.`);
        
        // Also verify Category collection
        const Category = mongoose.model('Category', new mongoose.Schema({ name: String }));
        const cats = await Category.find({});
        console.log(`Current Category collection size: ${cats.length}`);
        if (cats.length > 0) {
            console.log('Sample category names:', cats.map(c => c.name).join(', '));
        }

        process.exit();
    } catch (error) {
        console.error('Error fixing categories:', error.message);
        process.exit(1);
    }
};

fixCategories();

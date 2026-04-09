const mongoose = require('mongoose');
const Course = require('./models/Course');

mongoose.connect('mongodb://127.0.0.1:27017/educraft').then(async () => {
    console.log('Connected to MongoDB');
    const result = await Course.updateMany(
        { status: { $ne: 'approved' } },
        { $set: { status: 'approved' } }
    );
    console.log(`${result.modifiedCount} courses approved!`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/educraft');

    // Clear db
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    const user = await User.create({ name: 'Test', email: 'test@test.com', password: 'password', role: 'student' });
    const course = await Course.create({
        title: 'Test Course',
        description: 'Desc',
        instructor: user._id,
        category: 'Tech',
        price: 10,
        videos: [{ title: 'Vid 1', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }]
    });

    await Enrollment.create({ student: user._id, course: course._id });

    const enrollments = await Enrollment.find({ student: user._id }).populate('course');
    console.log(JSON.stringify(enrollments, null, 2));

    process.exit(0);
}

test();

const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/educraft';

const coursesData = [
    {
        title: 'Data Structures and Algorithms',
        description: 'A comprehensive guide to Data Structures and Algorithms. Master the fundamentals required to ace coding interviews and build efficient software.',
        price: 49,
        category: 'Computer Science',
        videos: [
            { title: 'Introduction to Arrays', duration: 15, url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM' },
            { title: 'Understanding Linked Lists', duration: 22, url: 'https://www.youtube.com/watch?v=njTh_OwMIVs' },
            { title: 'Trees and Graphs', duration: 35, url: 'https://www.youtube.com/watch?v=oSWTXtMglKE' }
        ]
    },
    {
        title: 'Operating Systems',
        description: 'Dive deep into Operating Systems. Learn about processes, threads, memory management, and file systems.',
        price: 39,
        category: 'Computer Science',
        videos: [
            { title: 'OS Basics', duration: 12, url: 'https://www.youtube.com/watch?v=vBURTt97EkA' },
            { title: 'Process Scheduling', duration: 25, url: 'https://www.youtube.com/watch?v=ewrovqeMFhQ' },
            { title: 'Memory Management', duration: 30, url: 'https://www.youtube.com/watch?v=qcxgwzHn9c4' }
        ]
    },
    {
        title: 'Computer Networks',
        description: 'Understand the internet and computer networks from the ground up. TCP/IP, OSI model, routing, and switching.',
        price: 29,
        category: 'Computer Science',
        videos: [
            { title: 'Introduction to Networks', duration: 18, url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8' },
            { title: 'The OSI Model', duration: 20, url: 'https://www.youtube.com/watch?v=HEEnLZV2wGI' },
            { title: 'TCP vs UDP', duration: 15, url: 'https://www.youtube.com/watch?v=uwoD5T_NDro' }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find or create an instructor
        let instructor = await User.findOne({ role: 'instructor' });
        if (!instructor) {
            instructor = await User.create({
                name: 'Expert Instructor',
                email: 'instructor@educraft.com',
                password: 'password123',
                role: 'instructor'
            });
            console.log('Created default instructor');
        }

        for (const courseData of coursesData) {
            const existing = await Course.findOne({ title: courseData.title });
            if (!existing) {
                await Course.create({ ...courseData, instructor: instructor._id });
                console.log(`Seeded course: ${courseData.title}`);
            } else {
                console.log(`Course already exists: ${courseData.title}`);
            }
        }

        console.log('Database seeded!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();

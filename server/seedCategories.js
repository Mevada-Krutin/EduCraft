const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/educraft';

const defaultCategories = [
    { name: 'Computer Science', description: 'Software development, algorithms, and data structures.' },
    { name: 'Web Development', description: 'Building modern websites and web applications.' },
    { name: 'Data Science', description: 'Data analysis, machine learning, and statistical modeling.' },
    { name: 'Business', description: 'Management, marketing, and entrepreneurship.' },
    { name: 'Design', description: 'UI/UX design, graphic design, and creative tools.' },
    { name: 'Marketing', description: 'Digital marketing, social media, and brand strategy.' },
];

const seedCategories = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB ✅');

        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`);
            }
        }

        console.log('Categories seeded successfully! 🚀');
        process.exit();
    } catch (error) {
        console.error('Error seeding categories ❌:', error.message);
        process.exit(1);
    }
};

seedCategories();

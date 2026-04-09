const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: ''
    },
    previewVideo: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    videos: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        duration: { type: Number }
    }],
    quizzes: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true }
    }],
    assignments: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        dueDate: { type: Date },
        totalPoints: { type: Number, default: 100 },
    }],
    reviews: [reviewSchema],
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
    enrolledStudents: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    type: {
        type: String,
        enum: ['assignment', 'quiz'],
        required: true
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId
    },
    content: {
        type: String // Text response or URL to file
    },
    score: {
        type: Number
    },
    totalPoints: {
        type: Number
    },
    status: {
        type: String,
        enum: ['submitted', 'graded', 'missed'],
        default: 'submitted'
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    feedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);

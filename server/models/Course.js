const mongoose = require('mongoose');

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
    videos: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        duration: { type: Number }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

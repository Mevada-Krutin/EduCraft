const express = require('express');
const Course = require('../models/Course');
const { protect, instructor } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({}).populate('instructor', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name');
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/courses
// @desc    Create a course
// @access  Private/Instructor
router.post('/', protect, instructor, async (req, res) => {
    const { title, description, price, category, videos } = req.body;

    try {
        const course = new Course({
            title,
            description,
            price,
            category,
            videos,
            instructor: req.user._id,
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

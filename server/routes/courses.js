const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
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

// @route   GET /api/courses/instructor/my-courses
// @desc    Get logged in instructor's courses
// @access  Private/Instructor
router.get('/instructor/my-courses', protect, instructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 });
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

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private/Instructor
router.put('/:id', protect, instructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is the course instructor
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this course' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private/Instructor
router.delete('/:id', protect, instructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this course' });
        }

        await Course.deleteOne({ _id: course._id });

        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/courses/:id/reviews
// @desc    Create new review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
        if (!isEnrolled) {
            return res.status(403).json({ message: 'You must be enrolled to leave a review' });
        }

        const alreadyReviewed = course.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Course already reviewed' });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        course.reviews.push(review);

        course.numReviews = course.reviews.length;
        course.rating =
            course.reviews.reduce((acc, item) => item.rating + acc, 0) /
            course.reviews.length;

        await course.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/enroll', protect, async (req, res) => {
    const { courseId } = req.body;

    try {
        const existingEnrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const enrollment = new Enrollment({
            student: req.user._id,
            course: courseId,
        });

        const createdEnrollment = await enrollment.save();
        res.status(201).json(createdEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/enrollments
// @desc    Get user enrollments
// @access  Private
router.get('/enrollments', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users/enrollments/:courseId/progress
// @desc    Update course progress
// @access  Private
router.post('/enrollments/:courseId/progress', protect, async (req, res) => {
    const { videoId } = req.body;
    const { courseId } = req.params;

    try {
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        }).populate('course');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Check if video is already completed by safely checking ObjectIds
        const isCompleted = enrollment.completedVideos.some(
            id => id.toString() === videoId
        );

        if (!isCompleted) {
            enrollment.completedVideos.push(videoId);

            // Recalculate progress based on total videos
            const totalVideos = enrollment.course.videos ? enrollment.course.videos.length : 0;
            const completedCount = enrollment.completedVideos.length;
            const progress = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

            enrollment.progress = progress;
            await enrollment.save();
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

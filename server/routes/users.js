const express = require('express');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { protect, admin } = require('../middleware/authMiddleware');

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
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            });
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

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users/enrollments/:courseId/quiz
// @desc    Submit quiz answers and grade automatically
// @access  Private
router.post('/enrollments/:courseId/quiz', protect, async (req, res) => {
    const { answers } = req.body; 
    const { courseId } = req.params;

    try {
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        }).populate('course');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        const course = enrollment.course;
        if (!course.quizzes || course.quizzes.length === 0) {
            return res.status(400).json({ message: 'No quiz available for this course' });
        }

        let correctAnswersCount = 0;
        course.quizzes.forEach((quiz, index) => {
            if (answers[index] === quiz.correctOptionIndex) {
                correctAnswersCount++;
            }
        });

        const scorePercentage = (correctAnswersCount / course.quizzes.length) * 100;

        if (scorePercentage >= 80) {
            enrollment.passedQuiz = true;
            await enrollment.save();
            res.json({ success: true, score: scorePercentage, message: 'Congratulations! You passed the quiz.' });
        } else {
            res.json({ success: false, score: scorePercentage, message: 'You need at least 80% to pass. Try again.' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

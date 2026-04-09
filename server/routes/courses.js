const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, instructor, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all active courses with optional search, filter, pagination
router.get('/', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const keyword = req.query.keyword
            ? { title: { $regex: req.query.keyword, $options: 'i' } }
            : {};

        const categoryFilter = req.query.category ? { category: req.query.category } : {};
        const priceFilter = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};
        
        // Show only approved courses to public
        const statusFilter = { status: 'approved' }; 

        const query = { ...keyword, ...categoryFilter, ...priceFilter, ...statusFilter };

        const count = await Course.countDocuments(query);
        const courses = await Course.find(query)
            .populate('instructor', 'name')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        res.json({ courses, page, pages: Math.ceil(count / limit), total: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/courses/admin/all
// @desc    Get all courses irrespective of status (Admin)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const count = await Course.countDocuments({});
        const courses = await Course.find({})
            .populate('instructor', 'name')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        res.json({ courses, page, pages: Math.ceil(count / limit), total: count });
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
    const { title, description, price, category, videos, thumbnail } = req.body;

    try {
        const course = new Course({
            title,
            description,
            price,
            category,
            videos,
            thumbnail,
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

// @route   PUT /api/courses/:id/status
// @desc    Update course status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        course.status = status;
        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/courses/:id/lessons
// @desc    Add a lesson to a course
// @access  Private/Instructor
router.post('/:id/lessons', protect, instructor, async (req, res) => {
    const { title, url, duration } = req.body;
    
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        course.videos.push({ title, url, duration });
        await course.save();
        
        res.status(201).json({ message: 'Lesson added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/courses/:id/quizzes
// @desc    Add a quiz question to a course
// @access  Private/Instructor
router.post('/:id/quizzes', protect, instructor, async (req, res) => {
    const { question, options, correctOptionIndex } = req.body;

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        course.quizzes.push({ question, options, correctOptionIndex });
        await course.save();
        
        res.status(201).json({ message: 'Quiz added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/courses/instructor/students
// @desc    Get all students enrolled in any of the instructor's courses
// @access  Private/Instructor
router.get('/instructor/students', protect, instructor, async (req, res) => {
    try {
        // 1. Find all courses by this instructor
        const courses = await Course.find({ instructor: req.user._id }).select('_id title');
        const courseIds = courses.map(c => c._id);

        // 2. Find all enrollments for these courses
        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email phone')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const Submission = require('../models/Submission');

// ... (existing routes stay same until line 305)

// @route   POST /api/courses/:id/assignments
// @desc    Add an assignment to a course
// @access  Private/Instructor
router.post('/:id/assignments', protect, instructor, async (req, res) => {
    const { title, description, dueDate, totalPoints } = req.body;
    
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        course.assignments.push({ title, description, dueDate, totalPoints });
        await course.save();
        
        res.status(201).json({ message: 'Assignment added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/courses/:id/assignments/:assignmentId/submit
// @desc    Submit an assignment
// @access  Private (Student)
router.post('/:id/assignments/:assignmentId/submit', protect, async (req, res) => {
    const { content } = req.body;
    
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
        if (!isEnrolled) return res.status(403).json({ message: 'Not enrolled' });

        const submission = new Submission({
            student: req.user._id,
            course: req.params.id,
            type: 'assignment',
            assignmentId: req.params.assignmentId,
            content,
            status: 'submitted'
        });

        await submission.save();
        res.status(201).json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/courses/:id/quizzes/submit
// @desc    Submit quiz results
// @access  Private (Student)
router.post('/:id/quizzes/submit', protect, async (req, res) => {
    const { score, totalPoints } = req.body;
    
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
        if (!isEnrolled) return res.status(403).json({ message: 'Not enrolled' });

        const submission = new Submission({
            student: req.user._id,
            course: req.params.id,
            type: 'quiz',
            score,
            totalPoints,
            status: 'graded' // Quizzes are auto-graded
        });

        await submission.save();
        res.status(201).json({ message: 'Quiz results recorded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/courses/:id/submissions
// @desc    Get all submissions for a course (Instructor only)
// @access  Private/Instructor
router.get('/:id/submissions', protect, instructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ course: req.params.id })
            .populate('student', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Initialize Razorpay instance
// Initialize Razorpay function to ensure env vars are ready
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// @route   GET /api/razorpay/key
// @desc    Get Razorpay Key ID
// @access  Private
router.get('/key', protect, (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID) {
        return res.status(500).json({ message: 'Razorpay Key ID missing in server environment' });
    }
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// @route   POST /api/razorpay/order
// @desc    Create a new Razorpay order
// @access  Private
router.post('/order', protect, async (req, res) => {
    const { courseId } = req.body;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Validate Price
        if (typeof course.price === 'undefined' || course.price <= 0) {
            return res.status(400).json({ message: 'This course is free or has no price set' });
        }

        // Amount in paise (1 INR = 100 paise)
        const amount = Math.round(parseFloat(course.price) * 100); 

        if (isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid course price format' });
        }

        const options = {
            amount: amount, 
            currency: 'INR', // Using INR as default for Razorpay India
            receipt: `rcpt_${Date.now()}`,
            notes: {
                courseId: courseId.toString(),
                userId: req.user._id.toString(),
            }
        };

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('RAZORPAY ORDER ERROR DETAILS:', error);
        res.status(500).json({ 
            message: 'Error creating payment order',
            details: error.description || error.error?.description || error.message 
        });
    }
});

// @route   POST /api/razorpay/verify
// @desc    Verify payment signature and enroll user
// @access  Private
router.post('/verify', protect, async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        courseId 
    } = req.body;

    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            // Enroll the student
            const existingEnrollment = await Enrollment.findOne({ 
                student: req.user._id, 
                course: courseId 
            });

            if (!existingEnrollment) {
                const enrollment = new Enrollment({
                    student: req.user._id,
                    course: courseId,
                    progress: 0,
                    completedVideos: [],
                });
                await enrollment.save();
                
                // Update course student count
                await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudents: 1 } });
            }

            res.json({ success: true, message: 'Payment verified and enrolled successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: 'Internal server error during verification' });
    }
});

module.exports = router;

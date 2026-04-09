const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/authMiddleware');

const stripeStr = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeStr, {
    apiVersion: '2023-10-16',
});

// @route   POST /api/payments/create-checkout-session
// @desc    Create a Stripe checkout session for a course purchase
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
    const { courseId } = req.body;

    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ message: 'Stripe Secret Key not configured in server environment.' });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.price === 0) {
            return res.status(400).json({ message: 'This course is free' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: course.title,
                            description: course.description.substring(0, 100) + '...',
                            images: ['https://placehold.co/600x400/2563eb/ffffff?text=' + encodeURIComponent(course.title)],
                        },
                        unit_amount: Math.round(course.price * 100), 
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5173/checkout-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course._id}`,
            cancel_url: `http://localhost:5173/course/${course._id}`,
            metadata: {
                courseId: course._id.toString(),
                userId: req.user._id.toString(),
            }
        });

        res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/payments/verify-session
// @desc    Verify a checkout session
// @access  Private
router.post('/verify-session', protect, async (req, res) => {
    const { sessionId } = req.body;
    
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            res.json({ success: true, courseId: session.metadata.courseId });
        } else {
            res.json({ success: false, message: 'Payment not successful yet' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Stripe Webhook Listener (Server-to-Server)
// @access  Public
router.webhook = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!webhookSecret) {
            console.warn('STRIPE_WEBHOOK_SECRET not set, accepting event without verification for dev.');
            event = JSON.parse(request.body.toString());
        } else {
            event = stripe.webhooks.constructEvent(request.body, sig, webhookSecret);
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const userId = session.metadata.userId;
        const courseId = session.metadata.courseId;

        try {
            // Check if enrollment already exists to prevent duplicates
            const existingEnrollment = await Enrollment.findOne({ student: userId, course: courseId });
            
            if (!existingEnrollment) {
                const enrollment = new Enrollment({
                    student: userId,
                    course: courseId,
                });
                await enrollment.save();
                console.log(`✅ Webhook: Safely enrolled User ${userId} into Course ${courseId}`);
            }
        } catch (error) {
            console.error('Error creating enrollment via webhook:', error);
            // Even if DB fails, acknowledge stripe receipt so it doesn't endlessly retry if it's a fatal DB error
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
};

module.exports = router;

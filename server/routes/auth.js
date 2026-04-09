const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production', {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone: req.body.phone || '',
            password,
            role: role || 'student',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/send-otp
// @desc    Send 4-digit OTP to user email
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const sendEmail = require('../utils/emailConfig');
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Email not registered' });
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Save to user
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send Email
        const message = `Your password reset code is: ${otp}. This code is valid for 10 minutes.`;
        console.log(`🔑 DEBUG: Generated OTP for ${email}: ${otp}`);
        
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Code - EduCraft',
            message
        });

        res.status(200).json({ 
            success: true, 
            message: 'Verification code sent to your email' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending verification code' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Verify OTP and update password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating password' });
    }
});

module.exports = router;

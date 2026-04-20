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

const isAllowedDomain = (email) => {
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return allowedDomains.includes(domain) || domain.endsWith('.edu') || domain.endsWith('.ac.in');
};

// @route   POST /api/auth/signup-otp
// @desc    Send 6-digit OTP for signup verification
router.post('/signup-otp', async (req, res) => {
    const { email } = req.body;
    const sendEmail = require('../utils/emailConfig');

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    if (!isAllowedDomain(email)) {
        return res.status(400).json({ 
            message: `Invalid email domain (${email.split('@')[1]}). Please use Gmail, Yahoo, Outlook, Hotmail, or an institutional (.edu / .ac.in) email.` 
        });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists && userExists.isEmailVerified) {
            return res.status(400).json({ message: 'User already exists and is verified' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        if (userExists) {
            // Update existing unverified user info in case they changed it
            const { name, password, role } = req.body;
            if (name) userExists.name = name;
            if (password) userExists.password = password;
            if (role) userExists.role = role;
            
            userExists.signupOTP = otp;
            userExists.signupOTPExpires = otpExpire;
            await userExists.save();
        } else {
            // Create a temporary unverified user record
            // Note: We don't have name/password yet, so we'll just save email and OTP
            // BUT wait, if we do this, the 'required' fields in schema will fail.
            // Let's modify the flow: Frontend sends name, email, password to signup-otp
            // and we create the user with isEmailVerified: false.
            const { name, password, role } = req.body;
            if (!name || !password) {
                return res.status(400).json({ message: 'Name and password are required' });
            }

            await User.create({
                name,
                email,
                password,
                role: role || 'student',
                isEmailVerified: false,
                signupOTP: otp,
                signupOTPExpires: otpExpire
            });
        }

        // Send Email
        const message = `Your EduCraft verification code is: ${otp}. This code is valid for 10 minutes.`;
        console.log(`🔑 DEBUG: Generated Signup OTP for ${email}: ${otp}`);
        
        await sendEmail({
            email,
            subject: 'Verify your EduCraft Account',
            message
        });

        res.status(200).json({ 
            success: true, 
            message: 'Verification code sent to your email' 
        });
    } catch (error) {
        console.error('Signup OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Alias for signup_otp (underscore) to support any client mismatches
router.post('/signup_otp', async (req, res) => {
    // Redirect to the hyphenated version
    req.url = '/signup-otp';
    router.handle(req, res);
});

// @route   POST /api/auth/register
// @desc    Verify OTP and finalize registration
router.post('/register', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ 
            email,
            signupOTP: otp,
            signupOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isEmailVerified = true;
        user.signupOTP = undefined;
        user.signupOTPExpires = undefined;
        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            token: generateToken(user._id),
        });
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
            if (!user.isEmailVerified) {
                return res.status(401).json({ message: 'Please verify your email address first' });
            }
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

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9_&]+$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and allowed characters are letters, numbers, _ and &',
        });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        // Create default categories for the user
        const defaultCategories = [
            { name: 'Food', icon: 'fast-food', color: '#FF6384', type: 'default', user: user._id },
            { name: 'Transport', icon: 'car', color: '#36A2EB', type: 'default', user: user._id },
            { name: 'Housing', icon: 'home', color: '#FFCE56', type: 'default', user: user._id },
            { name: 'Utilities', icon: 'flash', color: '#4BC0C0', type: 'default', user: user._id },
            { name: 'Entertainment', icon: 'game-controller', color: '#9966FF', type: 'default', user: user._id },
            { name: 'Health', icon: 'medkit', color: '#FF9F40', type: 'default', user: user._id },
        ];

        await Category.insertMany(defaultCategories);

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        photo: user.photo,
    });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const upload = require('../middleware/upload');
router.put('/updatedetails', protect, upload.single('photo'), async (req, res) => {
    const fieldsToUpdate = {
        name: req.body.name,
        mobile: req.body.mobile,
    };

    if (req.body.email) {
        // Check if email is being changed and if it's already taken
        if (req.body.email !== req.user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            fieldsToUpdate.email = req.body.email;
        }
    }

    if (req.file) {
        // Construct URL for the uploaded file
        // Assuming server runs on localhost:5000 or similar, but storing relative path is better for portability
        // We will store the relative path and prepend base URL in frontend
        fieldsToUpdate.photo = `uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        photo: user.photo,
        token: generateToken(user._id), // Optional: refresh token if needed
    });
});

// @desc    Send Verification Email (OTP)
// @route   POST /api/auth/send-verification
// @access  Private
const sendEmail = require('../utils/sendEmail');
router.post('/send-verification', protect, async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    const message = `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Change Verification Code',
            message,
        });

        res.status(200).json({ message: 'Verification code sent to email' });
    } catch (error) {
        console.error(error);
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();
        res.status(500).json({ message: 'Email could not be sent' });
    }
});

// @desc    Update Password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, async (req, res) => {
    const { otp, newPassword } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9_&]+$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and allowed characters are letters, numbers, _ and &',
        });
    }

    const user = await User.findById(req.user.id);

    if (
        user.otp === otp &&
        user.otpExpire > Date.now()
    ) {
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
    }
});

// @desc    Delete User Account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
router.delete('/deleteaccount', protect, async (req, res) => {
    console.log('Delete account request received for user:', req.user.id);
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all data associated with user
        await Expense.deleteMany({ user: userId });
        await Income.deleteMany({ user: userId });
        await Category.deleteMany({ user: userId });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

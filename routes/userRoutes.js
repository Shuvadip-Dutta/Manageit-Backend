const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const VerifiedEmail = require('../models/VerifiedEmail');
const { authenticateToken, tokenBlacklist } = require('../middleware/authenticateToken');

const JWT_SECRET = 'YzICerzt2Y16pb8c';

// Create a transport for sending emails
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "206f93825a3e7e",
        pass: "753d1b4c922a31"
    }
});


//Routes

// OTP registration
router.post('/register/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const otp = crypto.randomInt(100000, 999999);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // Save OTP to the database
        await Otp.create({ email, otp, expiresAt });

        await transporter.sendMail({
            from: 'no-reply@yourdomain.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP for registration is ${otp}. It will expire in 5 minutes.`
        });

        res.json({ message: 'OTP sent to email.',otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending OTP. Please try again later.' });
    }
});

//Verification
router.post('/register/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (otpRecord.expiresAt < Date.now()) {
            await Otp.deleteOne({ email }); // Clean up expired OTP
            return res.status(400).json({ error: 'OTP has expired' });
        }

        await Otp.deleteOne({ email }); // Clean up on successful verification
        await VerifiedEmail.create({ email });
        res.json({ message: 'OTP verified successfully.',otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during OTP verification. Please try again later.' });
    }
});


//Registration
router.post('/register/complete', async (req, res) => {
    const { email, name, dob, phoneNum, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        const verifiedEmail = await VerifiedEmail.findOne({ email });
        if (!verifiedEmail) {
            return res.status(403).json({ error: 'OTP verification required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        };

        const newUser = new User({ name, email, dob, phoneNum, password });
        await newUser.save();

        await VerifiedEmail.deleteOne({ email });

        res.status(201).json({ message: 'User registered successfully...' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during registration. Please try again later.' });
    }
});

//Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        };

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        };

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '3d' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during login. Please try again later.' });
    }
});


//Profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        };

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during login. Please try again later.' });
    }
})

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { name, email, dob, phoneNum } = req.body;
    const userId = req.user.userId;

    try {
        const updatedData = {};

        // Only update fields that are provided
        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (dob) updatedData.dob = dob;
        if (phoneNum) updatedData.phoneNum = phoneNum;

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the profile. Please try again later.' });
    }
})

//Logout
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        tokenBlacklist.push(token);
        res.status(200).json({ message: 'Logged out successful...' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while logging out the account. Please try again later.' });
    }
});


//Delete
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.userId);
        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the account. Please try again later.' });
    }
});

// Forgot Password
router.post('/forgot-password/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999);
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Save OTP in the database
        await Otp.create({ email, otp, expiresAt });

        await transporter.sendMail({
            from: 'no-reply@yourdomain.com',
            to: email,
            subject: 'Your OTP for Password Reset',
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });

        res.json({ message: 'OTP sent to email.',otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending OTP. Please try again later.' });
    }
});

// Reset Password otp verification
router.post('/reset-password/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email, otp, expiresAt: { $gt: Date.now() } });

        if (!otpRecord) {
            return res.status(400).json({ error: 'OTP is invalid or has expired.' });
        }
        await Otp.deleteOne({ _id: otpRecord._id });
        await VerifiedEmail.create({ email });

        res.json({ message: 'OTP verified successfully. Proceed to change password.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during OTP verification. Please try again later.' });
    }
});

//Reset password
router.post('/reset-password/change-password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        const verifiedEmail = await VerifiedEmail.findOne({ email });
        if (!verifiedEmail) {
            return res.status(403).json({ error: 'OTP verification required.' });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }

        // Update the password
        user.password = newPassword;
        await user.save();

        await VerifiedEmail.deleteOne({ email });

        res.json({ message: 'Your password has been changed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while changing the password. Please try again later.' });
    }
});


module.exports = router;
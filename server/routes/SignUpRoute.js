import { Router } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import twilio from "twilio";
import dotenv from 'dotenv';
import User from "../models/User.js";

dotenv.config();

const router = Router();

// Temporary storage for OTPs (use a database or Redis in production)
const otpStorage = new Map();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
    // debug: true,
    // logger: true,
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Transporter verification failed:", error);
    } else {
        console.log("Transporter is ready to send emails");
    }
});

// Load credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


if (!accountSid || !authToken) {
    throw new Error('Twilio SID or Auth Token is missing.');
}

const client = twilio(accountSid, authToken);

const sendEmailOTP = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: email,
        subject: "Your Password Reset OTP",
        text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    });
};

const sendPhoneOTP = async (phoneNumber, otp) => {
    await client.messages.create({
        body: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
        messagingServiceSid: process.env.TWILIO_SERVICE_SID,
        to: phoneNumber
    })
};

const generateDiscountCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';

    // Generate 4 random letters
    for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Generate 4 random numbers
    for (let i = 0; i < 4; i++) {
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return code;
};

// Example Output: "XZQP8492", "LKJM7451", "QWER1234"

router.post('/signup', async (req, res) => {
    console.log('Request body:', req.body);
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        const existingUserByPhone = await User.findOne({ phoneNumber });
        if (existingUserByPhone) {
            return res.status(400).json({ success: false, message: "Phone number already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate discount code & expiration date (only for new users)
        const discountCode = generateDiscountCode();
        const discountExpiresAt = new Date();
        discountExpiresAt.setMonth(discountExpiresAt.getMonth() + 1); // 1 month validity

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            phoneNumber,
            discountCode,
            discountExpiresAt,
        });
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await newUser.save();
        res.status(201).json({ 
            success: true, 
            user: newUser, 
            token, 
            discountCode, 
            discountExpiresAt 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate a JWT token (optional)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/forgot-password/request-otp', async (req, res) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ success: false, message: "Either email or phone number is required" });
    }

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else {
            user = await User.findOne({ phoneNumber: phone });
        }

        if (!user) {
            console.error("No user found with the provided email.");
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = email || phone;
        otpStorage.set(otpKey, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        // Send OTP via email
        if (email) {
            await sendEmailOTP(email, otp);
        } else if (phone) {
            await sendPhoneOTP(phone, otp);
        }

        res.status(200).json({ success: true, message: `${email ? 'Email' : 'Phone number'} OTP sent` });
    } catch (error) {
        console.error("Error in /forgot-password/request-otp:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error: error.message // Send detailed error
        });
    }
});

router.post('/forgot-password/verify-otp', (req, res) => {
    const { email, phone, otp } = req.body;
    const otpKey = email || phone;

    if (!otpKey || !otp) {
        return res.status(400).json({ success: false, message: "Email/Phone and OTP are required" });
    }

    const storedOtp = otpStorage.get(otpKey);
    if (!storedOtp) {
        return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    if (Date.now() > storedOtp.expiresAt) {
        return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (storedOtp.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    otpStorage.delete(otpKey); // Remove OTP after verification
    res.status(200).json({ success: true, message: "OTP verified successfully" });
});

router.post('/forgot-password/reset-password', async (req, res) => {
    const { email, phone, newPassword } = req.body;

    if ((!email && !phone) || !newPassword) {
        return res.status(400).json({ success: false, message: "Email/Phone and new password are required" });
    }

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (phone) {
            user = await User.findOne({ phoneNumber: phone });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
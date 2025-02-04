import { Router } from "express";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import validator from "email-validator";
import Subscriber from "../models/Subscriber.js";

dotenv.config();

const router = Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,  // Your email address
        pass: process.env.GMAIL_PASSWORD,  // Your email password
    },
});

router.get("/subscribers", async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 }); // Fetch and sort by date
        res.status(200).json(subscribers);
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ message: "Error fetching subscribers", error });
    }
});

router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    // Validate email format
    if (!email || !validator.validate(email)) {
        return res.status(400).json({ message: "Invalid or missing email address" });
    }

    console.log('Received data:', { email })

    try {
        // Save subscriber to the database
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,  // Where you want to receive the contact form
            subject: `Thank you for subscribing!`,
            text: "Thank you for subscribing to our newsletter!",
            html: "<h1>Thank You!</h1><p>You are now subscribed to our newsletter.</p>",
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email', error });
            }
            res.status(200).json({ message: 'Message sent successfully' });
        });
    } catch (error) {
        console.error("Error saving subscriber:", error);
        res.status(500).json({ message: "Error subscribing", error });
    }
});

export default router;
import { Router } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Message from "../models/Message.js";
import Subscriber from "../models/Subscriber.js";

dotenv.config();
const router = Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

router.post("/send-message", async (req, res) => {
    const { recipient, subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required." });
    }

    try {
        let emails = [];

        if (recipient && recipient.length > 0) {
            // If recipients are specified, use them
            emails = Array.isArray(recipient) ? recipient : [recipient];
        } else {
            // If no recipients, send to all subscribers
            const subscribers = await Subscriber.find({});
            emails = subscribers.map((sub) => sub.email);
        }

        if (emails.length === 0) {
            return res.status(400).json({ error: "No recipients found." });
        }

        // Send emails to all recipients
        for (const email of emails) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject,
                text: message,
            };

            await transporter.sendMail(mailOptions);
        }

        // Save the message to history
        const newMessage = new Message({ subject, message, sentAt: new Date() });
        await newMessage.save();

        res.status(200).json({ message: "Emails sent successfully and saved to history." });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send emails.", error });
    }
});

router.get("/message-history", async (req, res) => {
    try {
        const messages = await Message.find().sort({ sentAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching message history:", error);
        res.status(500).json({ message: "Failed to fetch message history.", error });
    }
});

export default router;
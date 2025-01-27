import { Router } from "express";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: "sujal0705gupta@gmail.com",  // Your email address
      pass: "hxbqndbjoafsudwo",  // Your email password
    },
});

router.post('/contact', (req,res) => {
    const { name, email, message } = req.body;
    console.log('Received data:', { name, email, message })

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,  // Where you want to receive the contact form
        subject: `New Contact Message from ${name}`,
        text: `Message from ${name} (${email}):\n\n${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email', error });
        }
        res.status(200).json({ message: 'Message sent successfully' });
    });
});

export default router;
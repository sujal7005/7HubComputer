import { Router } from "express";
import nodemailer from 'nodemailer';

const router = Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "sujal0705gupta@gmail.com",  // Your email address
      pass: "nwtvkzxoidwxpaqu",  // Your email password
    },
});

router.post('/support', (req,res) => {
    const { title, name, email, message } = req.body;
    console.log('Received data:', { name, email, message })

    let supportEmail = '';

    switch (title) {
        case 'Technical Support':
          supportEmail = 'techsupport@example.com';
          break;
        case 'Customer Service':
          supportEmail = 'customerservice@example.com';
          break;
        case 'Billing and Payments':
          supportEmail = 'billing@example.com';
          break;
        case 'Feedback and Suggestions':
          supportEmail = 'feedback@example.com';
          break;
        default:
          return res.status(400).json({ message: 'Invalid support category' });
    }

    const mailOptions = {
        from: email,
        to: supportEmail,  // Where you want to receive the contact form
        subject: `Support Request: ${title} - ${name}`,
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
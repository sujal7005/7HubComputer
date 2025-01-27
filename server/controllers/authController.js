import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "863030671533-jfc601o3jbou0dnsu9obvasrq2i7onlm.apps.googleusercontent.com");
// Google sign-in handler
export const googleSignin = async (req, res) => {
  const { credential } = req.body; // Extract Google token from request body
  console.log('Received credential:', credential);
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Extract user details
    const { sub: googleId, email, name } = payload;
    
    // Check if user exists in your database
    let user = await User.findOne({ email });
    if (!user) {
        // Create new user if not exists
        user = new User({ name, email, password: '', phoneNumber: '', addresses: [] });
        await user.save();
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ success: false, message: 'Google sign-in failed' });
  }
};

// Facebook sign-in handler
export const facebookSignin = async (req, res) => {
  const { accessToken } = req.body; // Extract Facebook access token
  try {
    // Handle the Facebook sign-in process here (verify token, etc.)
    res.json({ success: true, user: { name: 'Facebook User' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Facebook sign-in failed' });
  }
};

// Twitter sign-in handler
export const twitterSignin = async (req, res) => {
  const { oauth_token, oauth_token_secret } = req.body; // Extract tokens
  try {
    // Handle the Twitter sign-in process here
    res.json({ success: true, user: { name: 'Twitter User' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Twitter sign-in failed' });
  }
};  
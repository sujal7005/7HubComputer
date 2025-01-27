import { Router } from "express";
import passport from "passport";
import { googleSignin, facebookSignin, twitterSignin } from "../controllers/authController.js";

const router = Router();

// Google Auth Routes
router.post("/google-signin", googleSignin);

// Facebook Auth Routes
router.post("/facebook-signin", facebookSignin);

// Twitter Auth Routes
router.post("/twitter-signin", twitterSignin);

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.json({ success: true, user: req.user });
});

// Facebook OAuth Routes
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  res.json({ success: true, user: req.user });
});

// Twitter OAuth Routes
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
import { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";
import { googleSignin, facebookSignin, twitterSignin } from "../controllers/authController.js";

const router = Router();
dotenv.config();

// Google Auth Routes
router.post("/google-signin", googleSignin);

// Facebook Auth Routes
router.post("/facebook-signin", facebookSignin);

// Twitter Auth Routes
// router.post("/twitter-signin", twitterSignin);

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/user.phonenumbers.read'] 
}));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(`http://localhost:5173/profile?user=${encodeURIComponent(JSON.stringify(req.user))}`);
});

// Facebook OAuth Routes
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`http://localhost:5173/profile?user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

// console.log("TWITTER_CONSUMER_KEY:", process.env.TWITTER_CONSUMER_KEY);
// console.log("TWITTER_CONSUMER_SECRET:", process.env.TWITTER_CONSUMER_SECRET);
// console.log("TWITTER_CALLBACK_URL:", process.env.TWITTER_CALLBACK_URL);

// Twitter OAuth Routes
router.get('/auth/twitter', (req, res, next) => {
  console.log("Initiating Twitter Authentication...");
  passport.authenticate('twitter', (err, user, info) => {
    if (err) {
      console.error("Twitter Auth Error:", err);
      return res.redirect("http://localhost:5173/signin");
    }
    next();
  })(req, res, next);
});

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: 'http://localhost:5173/signin' }),
  (req, res) => {
    if (!req.user) {
      console.error("Twitter User Not Found");
      return res.redirect("http://localhost:5173/signin");
    }

    console.log("Authenticated User:", req.user);

    const token = jwt.sign(
      { name: req.user.displayName, username: req.user.username, email: req.user.emails?.[0]?.value || "" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`http://localhost:5173/profile?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);



export default router;
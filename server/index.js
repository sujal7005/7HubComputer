import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";
import http from 'http';
import productRoutes from './routes/productRoutes.js';
import SignUpRoutes from './routes/SignUpRoute.js';
import paymentRoutes from './routes/payment.js';
import CartRoutes from './routes/CartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ContactRoutes from './routes/ContactRoutes.js';
import AdminRoutes from './routes/AdminRoutes.js';
import SubscribeRoutes from './routes/SubscribeRoutes.js';
import MessageRoutes from './routes/MessageRoutes.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "*",
    origin: "process.env.REACT_APP", // Your frontend's origin
    methods: ["GET", "POST", 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({
  // origin: "*",
  origin: 'process.env.REACT_APP',
  methods: ["GET", "POST", 'PUT', 'DELETE'],
  credentials: true,
}));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
  // Logic to find or create user in database
  done(null, profile);
}));

// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_CLIENT_ID,
//   clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//   callbackURL: "http://localhost:5000/auth/facebook/callback",
// }, (accessToken, refreshToken, profile, done) => {
//   // Logic to find or create user in database
//   done(null, profile);
// }));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:5000/auth/twitter/callback",
}, (token, tokenSecret, profile, done) => {
  // Logic to find or create user in database
  done(null, profile);
}));

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

// In-memory store for online users
export const onlineUsers = new Map();

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  console.log("Current online users:", Array.from(onlineUsers.entries())); 

  // Mark user as online
  socket.on("user-online", (userId) => {
    if (userId) {
      onlineUsers.set(socket.id, userId);
      console.log("User online:", userId);
    } else {
      console.log("Invalid userId received");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const userId = onlineUsers.get(socket.id);  // Get the userId from the socket.id
    if (userId) {
      onlineUsers.delete(socket.id);  // Remove the socket from the map
      console.log("User disconnected:", userId);
    }
    console.log("Current online users:", Array.from(onlineUsers.entries()));
  });
});

app.use(express.json({ limit: '50mb' }));
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('build'));
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', SignUpRoutes);
app.use('/api', paymentRoutes);
app.use('/api', CartRoutes);
app.use('/api/users', userRoutes);
app.use('/api', ContactRoutes);
app.use('/api', AdminRoutes);
app.use('/api', SubscribeRoutes);
app.use('/api', MessageRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });

app.get("/socket.io", (req, res, next) => {
  res.setHeader("Content-Type", "application/javascript");
  next();
});

// Routes for OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Import User model
const User = require('./models/User');

// =============================================================================
// EXPRESS CONFIGURATION
// =============================================================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// =============================================================================
// PASSPORT CONFIGURATION
// =============================================================================

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        } else {
            // Create new user
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
            });
            await user.save();
            return done(null, user);
        }
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize/Deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/main');
    }
);

// Login page - redirect to main if already logged in
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/main');
    }
    res.render('login');
});

// Logout
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// =============================================================================
// APPLICATION ROUTES
// =============================================================================

// Landing page
app.get("/", (req, res) => res.render("index"));

// Main dashboard
const main = require('./routes/main.js');
app.use("/main", main);

// Menu display
const menu = require('./routes/menu.js');
app.use("/show", menu);

// QR code generation
const qrcode = require('./routes/qrcode.js');
app.use("/qrcode", qrcode);

// Menu analysis API
const analyzeMenu = require('./routes/analyze-menu.js');
app.use("/", analyzeMenu);

// =============================================================================
// SERVER START
// =============================================================================

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
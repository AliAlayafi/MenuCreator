const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const port = process.env.PORT;
const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: true}));



app.use(session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));




mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));



app.listen(port, () => {
    console.log("Running")
});



// Login - Register | Views
const login = require('./routes/login.js')
const register = require('./routes/register.js')
app.use("/login", login)
app.use("/register", register)

// logout
const logout = require('./routes/logout.js')
app.use("/logout", logout)



// Main Page
const main = require('./routes/main.js')
app.use("/main",main)

// Display menu
const menu = require('./routes/menu.js')
app.use("/show",menu)

const qrcode = require('./routes/qrcode.js')
app.use("/qrcode",qrcode)


// at this moment there is no landing page
app.get("/", (req,res) => res.redirect("/login"))




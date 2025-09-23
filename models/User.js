const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    createDate: { type: Date, default: Date.now },
});

// No pre-save validation needed for Google OAuth users

module.exports = mongoose.model('User', userSchema);
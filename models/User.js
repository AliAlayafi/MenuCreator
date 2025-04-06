const mongoose = require('mongoose');
const { validateUsername, validateEmail,validatePassword } = require('../utils/register_validation');
const { hashPassword } = require('../utils/passwordUtils'); 

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    createDate: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
    // Validate username
    if (!validateUsername(this.username)) {
        const error = new Error('Invalid username. Only letters are allowed.');
        return next(error);
    }

    // Validate email
    if (!validateEmail(this.email)) {
        const error = new Error('Invalid email format.');
        return next(error);
    }

    // Validate password
    if (!validatePassword(this.password)) {
        const error = new Error('Password must be at least 8 characters long.');
        return next(error);
    }

    // Hash password if modified
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
    
    next();
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const { validateMenu } = require('../public/js/validate-menu'); 

const menuSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    uuid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    menu: {
        type: mongoose.Schema.Types.Mixed, // This can store any JSON object
        default: [],
        required: false
    },
    views: { type: Number, default: 0 }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});


menuSchema.pre('save', function(next) {
    const menuData = this.menu;
    if (!validateMenu(menuData)) {
        return next(new Error('Invalid menu format'));
    }
    // If the data is valid, proceed with saving
    next();
});

module.exports = mongoose.model('Menu', menuSchema);

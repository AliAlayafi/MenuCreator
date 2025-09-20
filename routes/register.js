const express = require('express');
const router = express.Router();

const User = require('../models/User');


router.get('/', (req, res) => {

    if(req.session.userId) return res.redirect('/main'); // Already Logged in
    
    return res.render('register', {alert: ""});
});


router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const newUser = new User({
            username,
            email,
            password, 
        });

        const savedUser = await newUser.save();

        req.session.userId = savedUser._id;


        return res.redirect('/main?alert=Registerd Successfully!');

    } catch (error) {
        if(error.errorResponse){
            return res.render('register', {alert:"The Cradential already exists.", username, email, password});
        }     
        return res.render('register', {alert:error.message, username, email, password});
    }
});




module.exports = router;

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../utils/auth');

const Menu = require('../models/Menu');

router.get("/:id", isAuthenticated, async (req,res) => {
    const uuid = req.params.id;

    try {
        const menu = await Menu.findOne({ id:req.user.id,uuid:uuid });
    
        if(!menu){
            return res.redirect("/main");
        }

        return res.render("qrcode", {url:uuid})

    } catch (error) {
        return res.status(404).send("Error occured.")
    }
})

module.exports = router;
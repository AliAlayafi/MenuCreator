const express = require('express');
const router = express.Router();

const Menu = require('../models/Menu');

router.get("/:id", async (req,res) => {

    const uuid = req.params.id;

    try {
        
        if(!req.session.userId) return res.redirect('/login');

        const menu = await Menu.findOne({ id:req.session.userId,uuid:uuid });
    
        if(!menu){
            return res.redirect("/login");
        }

        return res.render("qrcode", {url:uuid})


    } catch (error) {
        return res.status(404).send("Error occured.")
    }

        

})

module.exports = router;
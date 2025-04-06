const express = require('express');
const router = express.Router();

const Menu = require('../models/Menu');

router.get("/:id", async (req,res) => {
    const uuid = req.params.id;
    try {
        const menu = await Menu.findOne({ uuid },"menu name");

        if(!menu){
            return res.send("Can't find the menu")
        }

        await menu.updateOne(
            { $inc: { views: 1 } }, // Increment the views count
            { timestamps: false }  // doesnt change the updateAt time
        );

        return res.render("menu-view", { menu: menu })

    } catch (error) {
        return res.send("Error occured.")
    }

})

module.exports = router;
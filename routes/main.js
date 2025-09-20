const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { validateMenu } = require('../public/js/validate-menu');

const Menu = require('../models/Menu');
// const User = require('../models/User');


router.get('/', async (req, res) => {

    try {
        

        if(!req.session.userId) return res.redirect('/login');

        const menu = await Menu.find({ id: req.session.userId },"uuid name updatedAt views");
        return res.render("main", {alert: req.query.alert || "", data:menu});


    } catch (error) {
        
    }

});


router.get("/:id", async (req, res) => {

    try {

        if(!req.session.userId) return res.redirect('/login');

        //check if the menu exist
        const menu = await Menu.findOne({ id: req.session.userId, uuid: req.params.id }, "menu" );
        if(!menu) throw new Error("Menu not found");

        return res.status(200).render("menu",{ data: menu.menu });


    } catch (error) {
        return res.redirect("/main");
    }

})


router.post("/:id", async (req, res) => {

    try {
        if (!req.session.userId) return res.redirect('/login');
        
        const data = req.body;
        
        // Validate menu data before saving
        if (!validateMenu(data)) {
            return res.status(400).json({ 
                status: 400, 
                message: "Invalid menu data format" 
            });
        }
        
        const menu = await Menu.findOne({ id: req.session.userId, uuid: req.params.id });
        if (!menu) throw new Error("Menu not found");
     
        menu.menu = data;
    
        // Save the updated menu to the database
        await menu.save();
    
        return res.status(200).json({ status: 200, message: "Menu updated successfully!" });
    
    } catch (error) {
        return res.status(400).json({ status: 400, message: error.message });
    }
    

})










router.post("/", async (req,res) => {

    try {

        const { name } = req.body;

        const existingMenu = await Menu.findOne({ id: req.session.userId, name });

        if(existingMenu){
            return res.status(404).send("The Menu Already exists.")
        }

        const uniqueId = uuidv4();

        const newMenu = new Menu({
            id: req.session.userId,
            uuid:uniqueId,
            name: name
        });

        await newMenu.save();

        return res.status(200).json({
            message:uniqueId
        });


    } catch (error) {
        return res.status(404).send("Error occured");
    }

})


router.delete("/", async (req,res) => {

    try {

        const { uuid } = req.body;
        
        // check if the uuid for the same user
        const existingMenu = await Menu.findOne({ id: req.session.userId, uuid });

        if(!existingMenu){
            return res.status(404).json({
                message:"Can't find the Menu."
            });
        }

        await existingMenu.deleteOne();
        return res.status(200).json({
            message:"Deleted Successfuly."
        });


    } catch (error) {
        return res.status(404).json({
            message:"Error occured."
        });;
    }

})



module.exports = router;

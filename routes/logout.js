const express = require('express');
const router = express.Router();


router.get("/", async (req,res) => {

    try {
        req.session.destroy();
        return res.redirect('/login');

    } catch (err) {
        return res.status(404).send("Error occured while logging out");
    }


})


module.exports = router;
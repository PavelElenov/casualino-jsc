const { login } = require("../services/userService");

const router = require("express").Router();

router.post("/", (req, res) => {
    try{
        const user = login(req.body.email, req.body.password);
        res.status(200);
        res.json(user);
    }catch(error){
        res.status(400);
        res.json(error.message);
    }
    
});

module.exports = router;
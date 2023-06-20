const { getAllUsers, getUserByUsername } = require("../services/userService");

const router = require("express").Router();


router.get("/users", (req, res) => {
    res.status(200);
    res.json(getAllUsers());
});

router.get("/:username", (req, res) => {
    res.json(getUserByUsername(req.params.username));
})

module.exports = router;
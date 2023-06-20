const { getAllChats } = require("../services/chatService");

const router = require("express").Router();

router.get("/", (req, res) => {
    const chats = getAllChats();
    res.json(chats);
});

module.exports = router;
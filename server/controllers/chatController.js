const { getAllChats, getConversationByName } = require("../services/chatService");

const router = require("express").Router();

router.get("/", (req, res) => {
    const chats = getAllChats();
    res.json(chats);
});

router.get("/:name", (req, res) => {
    try{
        const conversation = getConversationByName(req.params.name);
        res.status(200).json(conversation);
    }catch(error){
        res.status(404);
        res.json(error.message);
    }
    
})

module.exports = router;
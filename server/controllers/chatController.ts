import { IConversation } from "../interfaces/conversation";
import { getAllChats, getConversationByName } from "../services/chatService";
import express from 'express';
import { checkUserAuthentication } from "../utils/checkForUserAuthentication";


const router = express.Router();

router.get("/", (req, res) => {
    try {
        const auth: boolean | string = checkUserAuthentication(req);

        if(auth){
            const chats: IConversation[] = getAllChats();
            res.json(chats);
        }else{
            res.status(401).json(auth);
        }
        
    } catch (error: any) {
        res.status(401);
        res.json(error.message);
    }

});

router.get("/:name", (req, res) => {
    try {
        const auth: string | boolean = checkUserAuthentication(req);
        if (auth) {
            const conversation = getConversationByName(req.params.name);
            res.status(200).json(conversation);
        } else {
            res.status(401).json(auth);
        }
    } catch (error: any) {
        res.status(404);
        res.json(error.message);
    }
})

module.exports = router;
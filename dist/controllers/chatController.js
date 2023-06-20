"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chatService_1 = require("../services/chatService");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    const chats = (0, chatService_1.getAllChats)();
    res.json(chats);
});
router.get("/:name", (req, res) => {
    try {
        const conversation = (0, chatService_1.getConversationByName)(req.params.name);
        res.status(200).json(conversation);
    }
    catch (error) {
        res.status(404);
        res.json(error.message);
    }
});
module.exports = router;

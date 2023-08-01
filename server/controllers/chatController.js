"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var chatService_1 = require("../services/chatService");
var express_1 = require("express");
exports.router = (0, express_1.Router)();
exports.router.get("/", function (req, res) {
    var chats = (0, chatService_1.getAllChats)();
    console.log(chats);
    res.json(chats);
});
exports.router.get("/:id", function (req, res) {
    try {
        var conversation = (0, chatService_1.getConversationById)(parseInt(req.params.id));
        res.status(200).json(conversation);
    }
    catch (error) {
        res.status(404);
        res.json(error.message);
    }
});
exports.router.get("/:id/lastMessages", function (req, res) {
    var lastMessages = (0, chatService_1.getLastMessagesOfConversation)(parseInt(req.params.id));
    if (lastMessages) {
        res.status(200).json(lastMessages);
    }
    else {
        res.status(204).json();
    }
});
exports.router.delete("/:id", function (req, res) {
    var conversationId = parseInt(req.params.id);
    (0, chatService_1.deleteChatById)(conversationId);
    res.status(204).json();
});
exports.router.delete("/:conversationId/messages/:messageId", function (req, res) {
    var _a = req.params, conversationId = _a.conversationId, messageId = _a.messageId;
    (0, chatService_1.deleteMessage)(parseInt(conversationId), parseInt(messageId));
    res.status(204).json();
});
exports.router.post("/", function (req, res) {
    var newChat = req.body.chat;
    var conversation = (0, chatService_1.createNewConversation)(newChat);
    res.status(200).json(conversation);
});
exports.router.post("/:name/like", function (req, res) {
    var name = req.params.name;
    (0, chatService_1.addLike)(name);
    res.status(204).json();
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var chatService_1 = require("../services/chatService");
var express_1 = require("express");
exports.router = (0, express_1.Router)();
exports.router.get("/", function (req, res) {
    var chats = (0, chatService_1.getAllChats)();
    res.json(chats);
});
exports.router.get("/:id", function (req, res) {
    try {
        var conversation = (0, chatService_1.getConversationById)(req.params.id);
        res.status(200).json(conversation);
    }
    catch (error) {
        res.status(404);
        res.json(error.message);
    }
});
exports.router.get("/:conversationId/lastMessages", function (req, res) {
    var conversationId = req.params.conversationId;
    var lastMessageId = req.query.lastMessageId;
    var lastMessages = (0, chatService_1.getLastMessagesOfConversation)(conversationId, lastMessageId);
    var messagesPerPage = (0, chatService_1.getMessagesPerPage)();
    res.status(200).json({ lastMessages: lastMessages, messagesPerPage: messagesPerPage });
});
exports.router.delete("/:id", function (req, res) {
    var conversationId = req.params.id;
    (0, chatService_1.deleteChatById)(conversationId);
    res.status(204).json();
});
exports.router.delete("/:conversationId/messages/:messageId", function (req, res) {
    var _a = req.params, conversationId = _a.conversationId, messageId = _a.messageId;
    (0, chatService_1.deleteMessage)(conversationId, messageId);
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

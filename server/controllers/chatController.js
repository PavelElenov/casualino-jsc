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
exports.router.get("/:name", function (req, res) {
    try {
        var conversation = (0, chatService_1.getConversationByName)(req.params.name);
        res.status(200).json(conversation);
    }
    catch (error) {
        res.status(404);
        res.json(error.message);
    }
});
exports.router.delete("/:name", function (req, res) {
    var chatName = req.params.name;
    console.log(chatName);
    (0, chatService_1.deleteChatByName)(chatName);
    res.status(204).json();
});
//conversations/1/messages/hi
exports.router.delete("/:name/messages/:messageText", function (req, res) {
    var _a = req.params, name = _a.name, messageText = _a.messageText;
    console.log(name, messageText);
    (0, chatService_1.deleteMessage)(name, messageText);
    res.status(204);
});

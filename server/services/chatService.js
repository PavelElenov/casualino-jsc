"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationByName = exports.addMessage = exports.getAllChats = exports.deleteChatByName = exports.deleteMessage = exports.addChat = exports.addLike = void 0;
var timeService_1 = require("./timeService");
var userService_1 = require("./userService");
var conversations = [
    {
        name: "1",
        messages: [],
        img: "https://i.pinimg.com/736x/f5/35/1b/f5351b460de396c8dfa2c9937f1f211c.jpg",
        level: 20,
        likes: 0
    },
    {
        name: "2",
        messages: [],
        img: "https://img.playbuzz.com/image/upload/ar_1.5,c_pad,f_jpg,b_auto/q_auto:good,f_auto,fl_lossy,w_480,c_limit,dpr_1/cdn/132af0ca-7be7-4cd8-84e3-9ad41df5c6a7/61791061-eb65-4342-a5f4-af1ae165edef_560_420.jpg",
        level: 30,
        likes: 0
    },
    {
        name: "3",
        messages: [],
        img: "https://png.pngtree.com/background/20230519/original/pngtree-three-smiling-faces-in-sunglasses-on-a-dark-background-picture-image_2657621.jpg",
        level: 40,
        likes: 0
    },
    {
        name: "4",
        messages: [],
        img: "https://cdn-icons-png.flaticon.com/512/6540/6540753.png",
        level: 50,
        likes: 0
    },
];
function addLike(conversationName) {
    var conversation = conversations.find(function (c) { return c.name == conversationName; });
    conversation.likes += 1;
}
exports.addLike = addLike;
var addChat = function (newChat) {
    conversations.push(newChat);
};
exports.addChat = addChat;
var deleteMessage = function (chatName, messageText) {
    var chat = conversations.find(function (c) { return c.name == chatName; });
    var messageInfo = chat.messages.find(function (m) { return m.text == messageText; });
    var messageIndex = chat.messages.indexOf(messageInfo);
    ;
    chat.messages.splice(messageIndex, 1);
};
exports.deleteMessage = deleteMessage;
var deleteChatByName = function (name) {
    var chat = conversations.find(function (c) { return c.name == name; });
    var index = conversations.indexOf(chat);
    conversations.splice(index, 1);
};
exports.deleteChatByName = deleteChatByName;
var getAllChats = function () {
    return conversations;
};
exports.getAllChats = getAllChats;
var addMessage = function (writerUsername, text, conversationName) {
    var conversation = conversations.find(function (c) { return c.name == conversationName; });
    var writer = (0, userService_1.getUserByUsername)(writerUsername);
    var message = { writer: writer, text: text, time: (0, timeService_1.getCurrentTimeInMinutes)() };
    conversation === null || conversation === void 0 ? void 0 : conversation.messages.push(message);
    return message;
};
exports.addMessage = addMessage;
var getConversationByName = function (conversationName) {
    var conversation = conversations.find(function (c) { return c.name == conversationName; });
    if (conversation) {
        return conversation;
    }
    throw new Error("Conversation with this name doesn\"t exist!");
};
exports.getConversationByName = getConversationByName;

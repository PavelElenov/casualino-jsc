"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationById = exports.addMessage = exports.getAllChats = exports.deleteChatById = exports.deleteMessage = exports.createNewConversation = exports.addLike = exports.returnUniqueId = exports.getLastMessagesOfConversation = exports.getMessagesPerPage = void 0;
var userService_1 = require("./userService");
var uuid_1 = require("uuid");
var conversations = [
    {
        id: "1",
        name: "1",
        img: "https://i.pinimg.com/736x/f5/35/1b/f5351b460de396c8dfa2c9937f1f211c.jpg",
        level: 20,
        likes: 0,
    },
    {
        id: "2",
        name: "2",
        img: "https://img.playbuzz.com/image/upload/ar_1.5,c_pad,f_jpg,b_auto/q_auto:good,f_auto,fl_lossy,w_480,c_limit,dpr_1/cdn/132af0ca-7be7-4cd8-84e3-9ad41df5c6a7/61791061-eb65-4342-a5f4-af1ae165edef_560_420.jpg",
        level: 30,
        likes: 0,
    },
    {
        id: "3",
        name: "3",
        img: "https://png.pngtree.com/background/20230519/original/pngtree-three-smiling-faces-in-sunglasses-on-a-dark-background-picture-image_2657621.jpg",
        level: 40,
        likes: 0,
    },
    {
        id: "4",
        name: "4",
        img: "https://cdn-icons-png.flaticon.com/512/6540/6540753.png",
        level: 50,
        likes: 0,
    },
];
var messages = [];
for (var i = 0; i < 30; i++) {
    messages.push({ id: (0, uuid_1.v4)(),
        writer: {
            username: "Pavel",
            level: 10,
            img: "",
        },
        text: i.toString(),
        time: Date.now() + i });
}
var allMessagesInfo = [
    {
        conversationId: "1",
        messages: messages,
    },
    {
        conversationId: "2",
        messages: [],
    },
    {
        conversationId: "3",
        messages: [],
    },
    {
        conversationId: "4",
        messages: [],
    },
];
var messagesPerPage = 6;
function getMessagesPerPage() {
    return messagesPerPage;
}
exports.getMessagesPerPage = getMessagesPerPage;
function getLastMessagesOfConversation(conversationId, lastMessageId) {
    var startIndex;
    var endIndex;
    var lastMessage = undefined;
    var currentConversationMessages = allMessagesInfo.find(function (data) { return data.conversationId === conversationId; }).messages;
    if (!lastMessageId) {
        startIndex = currentConversationMessages.length - messagesPerPage - 1;
        endIndex = currentConversationMessages.length;
    }
    else {
        lastMessage = currentConversationMessages.find(function (m) { return m.id === lastMessageId; });
        startIndex =
            currentConversationMessages.indexOf(lastMessage) - messagesPerPage; //This start index can be negative number
        endIndex = currentConversationMessages.indexOf(lastMessage);
    }
    if (currentConversationMessages.length > 0) {
        var lastMessages = currentConversationMessages.slice(Math.max(0, startIndex), endIndex);
        return lastMessages;
    }
    return [];
}
exports.getLastMessagesOfConversation = getLastMessagesOfConversation;
function returnUniqueId() {
    return (0, uuid_1.v4)();
}
exports.returnUniqueId = returnUniqueId;
function addLike(conversationName) {
    var conversation = conversations.find(function (c) { return c.name == conversationName; });
    conversation.likes += 1;
}
exports.addLike = addLike;
var createNewConversation = function (newChat) {
    var conversation = __assign(__assign({}, newChat), { id: returnUniqueId() });
    conversations.push(conversation);
    allMessagesInfo.push({ conversationId: conversation.id, messages: [] });
    return conversation;
};
exports.createNewConversation = createNewConversation;
var deleteMessage = function (conversationId, messageId) {
    var messagesInfo = allMessagesInfo.find(function (data) { return data.conversationId === conversationId; });
    var message = messagesInfo.messages.find(function (m) { return m.id === messageId; });
    var messageIndex = messagesInfo.messages.indexOf(message);
    messagesInfo.messages.splice(messageIndex, 1);
};
exports.deleteMessage = deleteMessage;
var deleteChatById = function (conversationId) {
    var conversation = conversations.find(function (c) { return c.id === conversationId; });
    var index = conversations.indexOf(conversation);
    conversations.splice(index, 1);
};
exports.deleteChatById = deleteChatById;
var getAllChats = function () {
    var allConversations = conversations.map(function (c) {
        var messagesInfo = allMessagesInfo.find(function (data) { return data.conversationId === c.id; });
        var lastMessage = messagesInfo === null || messagesInfo === void 0 ? void 0 : messagesInfo.messages[messagesInfo.messages.length - 1];
        return __assign(__assign({}, c), { lastMessage: lastMessage });
    });
    return allConversations;
};
exports.getAllChats = getAllChats;
var addMessage = function (data) {
    var messagesInfo = allMessagesInfo.find(function (messageInfo) { return messageInfo.conversationId === data.conversationId; });
    var writer = (0, userService_1.getUserByUsername)(data.writer.username);
    var message = {
        id: returnUniqueId(),
        writer: writer,
        text: data.text,
        time: data.time,
    };
    messagesInfo.messages.push(message);
    return message;
};
exports.addMessage = addMessage;
var getConversationById = function (conversationId) {
    var conversation = conversations.find(function (c) { return c.id === conversationId; });
    if (conversation) {
        return conversation;
    }
    throw new Error("Conversation with this name doesn\"t exist!");
};
exports.getConversationById = getConversationById;

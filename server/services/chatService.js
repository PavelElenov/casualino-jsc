"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationByName = exports.addMessage = exports.getAllChats = void 0;
var conversations = [
    {
        name: '1',
        messages: [
            {
                writer: 'Pavel',
                text: "Hi I am Pavel :)"
            },
            {
                writer: "Plamen",
                text: "Hi Pavel it's nice to meet you"
            }
        ]
    },
    {
        name: '2',
        messages: []
    },
    {
        name: '3',
        messages: []
    },
    {
        name: '4',
        messages: []
    },
];
var getAllChats = function () {
    return conversations;
};
exports.getAllChats = getAllChats;
var addMessage = function (writer, text, conversationName) {
    var conversation = conversations.find(function (c) { return c.name = conversationName; });
    conversation === null || conversation === void 0 ? void 0 : conversation.messages.push({ writer: writer, text: text });
};
exports.addMessage = addMessage;
var getConversationByName = function (conversationName) {
    var conversation = conversations.find(function (c) { return c.name == conversationName; });
    if (conversation) {
        return conversation;
    }
    throw new Error("Conversation with this name doesn't exist!");
};
exports.getConversationByName = getConversationByName;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationByName = exports.addMessage = exports.getAllChats = void 0;
let conversations = [
    {
        name: '1',
        messages: [
            {
                writer: 'Pavel',
                text: "Hi I am Pavel :)"
            },
            {
                writer: "Plamen",
                text: `Hi Pavel it's nice to meet you`
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
const getAllChats = () => {
    return conversations;
};
exports.getAllChats = getAllChats;
const addMessage = (writer, text, conversationName) => {
    const conversation = conversations.find(c => c.name = conversationName);
    conversation === null || conversation === void 0 ? void 0 : conversation.messages.push({ writer, text });
};
exports.addMessage = addMessage;
const getConversationByName = (conversationName) => {
    const conversation = conversations.find(c => c.name == conversationName);
    if (conversation) {
        return conversation;
    }
    throw new Error(`Conversation with this name doesn't exist!`);
};
exports.getConversationByName = getConversationByName;

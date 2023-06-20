let conversations = [
    {
        name: '1',
        messages: []
    },
    {
        name: '2',
        messages: [
        ]
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

const addMessage = (creator, text, conversationName) => {
    let conversation = conversations.find(c => c.name = conversationName);
    conversation.messages.push({creator, text});
}

module.exports = {
    getAllChats,
    addMessage
}
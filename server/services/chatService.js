let conversations = [
    {
        name: '1',
        messages: [
            {
                writer:'Pavel',
                text: "Hi I am Pavel :)"
            },
            {
                writer: "Plamen",
                text:`Hi Pavel it's nice to meet you`
            }
        ]
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
    conversation.messages.push({ writer: creator, text });
}

const getConversationByName = (conversationName) => {
    const conversation = conversations.find(c => c.name == conversationName);

    if (conversation) {
        return conversation;
    }

    throw new Error(`Conversation with this name doesn't exist!`);
}

module.exports = {
    getAllChats,
    addMessage,
    getConversationByName
}
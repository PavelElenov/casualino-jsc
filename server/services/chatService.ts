import { IConversation } from "../../interfaces/conversation";


const conversations: IConversation[] = [
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

export const getAllChats = (): IConversation[] => {
    return conversations;
};

export const addMessage = (writer:string, text:string, conversationName:string): void => {
    const conversation: IConversation | undefined = conversations.find(c => c.name = conversationName);
    conversation?.messages.push({ writer, text });
}

export const getConversationByName = (conversationName: string): IConversation | Error => {
    const conversation = conversations.find(c => c.name == conversationName);

    if (conversation) {
        return conversation;
    }

    throw new Error(`Conversation with this name doesn't exist!`);
}
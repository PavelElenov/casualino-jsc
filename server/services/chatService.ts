import { IConversation } from "../../interfaces/conversation";


const conversations: IConversation[] = [
    {
        name: '1',
        messages: [
        ],
        img: "https://i.pinimg.com/736x/f5/35/1b/f5351b460de396c8dfa2c9937f1f211c.jpg",
        level: 20
    },
    {
        name: '2',
        messages: [
        ],
        img: "https://img.playbuzz.com/image/upload/ar_1.5,c_pad,f_jpg,b_auto/q_auto:good,f_auto,fl_lossy,w_480,c_limit,dpr_1/cdn/132af0ca-7be7-4cd8-84e3-9ad41df5c6a7/61791061-eb65-4342-a5f4-af1ae165edef_560_420.jpg",
        level: 30
    },
    {
        name: '3',
        messages: [],
        img: "https://png.pngtree.com/background/20230519/original/pngtree-three-smiling-faces-in-sunglasses-on-a-dark-background-picture-image_2657621.jpg",
        level: 40
    },
    {
        name: '4',
        messages: [],
        img: "https://cdn-icons-png.flaticon.com/512/6540/6540753.png",
        level: 50
    },
];

export const getAllChats = (): IConversation[] => {
    return conversations;
};

export const addMessage = (writer:string, text:string, conversationName:string): void => {
    const conversation: IConversation | undefined = conversations.find(c => c.name = conversationName);
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalTime = hours * 60 + minutes;
    conversation?.messages.push({ writer, text, time: totalTime });
}

export const getConversationByName = (conversationName: string): IConversation | Error => {
    const conversation = conversations.find(c => c.name == conversationName);

    if (conversation) {
        return conversation;
    }

    throw new Error(`Conversation with this name doesn't exist!`);
}
import { IConversation, IMessage } from "../../shared/interfaces/conversation";
import { IUserSomeInfo } from "../../shared/interfaces/user";
import { getCurrentTimeInMinutes } from "./timeService";
import { getUserByUsername } from "./userService";


const conversations: IConversation[] = [
    {
        name: "1",
        messages: [
        ],
        img: "https://i.pinimg.com/736x/f5/35/1b/f5351b460de396c8dfa2c9937f1f211c.jpg",
        level: 20,
        likes: 0
    },
    {
        name: "2",
        messages: [
        ],
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

export function addLike(conversationName: string){
    const conversation: IConversation = conversations.find(c => c.name == conversationName)!;
    conversation.likes += 1;
}

export const addChat = (newChat:IConversation) => {
    conversations.push(newChat);
}
export const deleteMessage = (chatName:string, messageText: string): void => {
    const chat:IConversation = conversations.find(c => c.name == chatName)!;
    const messageInfo:IMessage = chat.messages.find(m => m.text == messageText)!
    const messageIndex = chat.messages.indexOf(messageInfo);;
    chat.messages.splice(messageIndex, 1);
}
export const deleteChatByName = (name: string): void => {
    const chat:IConversation = conversations.find(c => c.name == name)!;
    const index:number = conversations.indexOf(chat!);
    conversations.splice(index, 1);
}
export const getAllChats = (): IConversation[] => {
    return conversations;
};

export const addMessage = (writerUsername:string, text:string, conversationName:string): IMessage => {
    const conversation: IConversation | undefined = conversations.find(c => c.name == conversationName);
    const writer:IUserSomeInfo = getUserByUsername(writerUsername);
    const message: IMessage = {writer: writer, text, time: getCurrentTimeInMinutes()};
    conversation?.messages.push(message);
    return message;
}

export const getConversationByName = (conversationName: string): IConversation | Error => {
    const conversation:IConversation | undefined = conversations.find(c => c.name == conversationName);

    if (conversation) {
        return conversation;
    }

    throw new Error(`Conversation with this name doesn"t exist!`);
}
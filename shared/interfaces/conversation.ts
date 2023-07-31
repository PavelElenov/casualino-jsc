export type IMessage = {
    writer: {
        username: string,
        level: number,
        img: string,
    },
    text: string,
    time: number
}

export type IConversation = {
    name: string,
    lastMessage: IMessage,
    img: string,
    level: number;
    likes: number
}

export type IMessageInfo = {
    writer: {
        username: string,
        level: number,
        img: string,
    },
    text:string,
    conversation: string;
}

export interface IFullMessageInfo{
    writer: {
        username: string,
        level: number,
        img: string,
    },
    text:string,
    conversation: string;
    time: number;
}
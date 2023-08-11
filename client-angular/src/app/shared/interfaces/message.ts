export type IMessage = {
    id: string,
    writer: {
        username: string,
        level: number,
        img: string,
    },
    text: string,
    time: number
}

export interface IConversationWithoutId{
    name: string,
    lastMessage?: IMessage | undefined,
    img: string,
    level: number;
    likes:number;
}
export interface IConversation extends IConversationWithoutId{
    id: string,
}

export type IMessageInfo = {
    writer: {
        username: string,
        level: number,
        img: string,
    },
    text:string,
    conversationId: string;
}

export interface IFullMessageInfo{
    writer: {
        username: string,
        level: number,
        img: string,
    },
    message: IMessage,
    conversationId: string;
    time: number;
}
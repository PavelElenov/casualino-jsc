export type IMessage = {
    id: number,
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
    id: number,
}

export type IMessageInfo = {
    writer: {
        username: string,
        level: number,
        img: string,
    },
    text:string,
    conversationId: number;
}

export interface IFullMessageInfo{
    writer: {
        username: string,
        level: number,
        img: string,
    },
    message: IMessage,
    conversationId: number;
    time: number;
}
export type IMessage = {
    id: string,
    writer: {
        username: string,
        level: number,
        img: string,
    },
    text: string,
    sending: boolean,
    time: number
}

export interface IConversation{
    id?:string,
    name: string,
    lastMessage?: IMessage | undefined,
    img: string,
    level: number;
    likes:number;
}

export interface IMessageInfo extends IMessage{
    conversationId: string;
}

export interface IFullMessageInfo{
    message: IMessage,
    conversationId: string;
    time: number;
}
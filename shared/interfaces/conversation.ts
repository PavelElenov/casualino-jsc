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
    img: string,
    level: number;
    likes: number
}

export interface IConversation extends IConversationWithoutId{
    id: string,
}

export interface IMessages{
    conversationId: string,
    messages: IMessage[]
}

export interface IConversationMoreInfo extends IConversation{
    lastMessage: IMessage | undefined
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
    text:string,
    conversation: string;
    time: number;
}
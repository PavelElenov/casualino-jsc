export type IMessage = {
    writer: string;
    text: string;
    time: number;
};
export type IConversation = {
    name: string;
    messages: IMessage[];
    img: string;
    level: number;
};
export type IMessageInfo = {
    writer: string;
    text: string;
    conversation: string;
};

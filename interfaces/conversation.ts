export type IMessage = {
    writer: string,
    text: string
}

export type IConversation = {
    name: string,
    messages: IMessage[]
}

export type IMessageInfo = {
    writer: string,
    text:string,
    conversation: string;
}
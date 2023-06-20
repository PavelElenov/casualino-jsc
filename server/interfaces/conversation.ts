export interface IMessage{
    writer: string,
    text: string
}

export interface IConversation{
    name: string,
    messages: IMessage[]
}
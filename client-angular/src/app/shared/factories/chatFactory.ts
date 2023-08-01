import { Injectable } from "@angular/core";
import { IConversation, IConversationWithoutId, IMessageInfo } from "../interfaces/message";
import { IUser } from "../interfaces/user";

@Injectable()
export class ChatFactory{
    createMessageInfoObject(user: IUser, messageText: string, chatId: number): IMessageInfo{
        return {
            writer: {
              username: user.username,
              level: user.level,
              img: user.img,
            },
            text: messageText,
            conversationId: chatId,
          };
    }

    createConversation(data:{name:string, img: string, level:number}): IConversationWithoutId{
        return {
            name: data.name,
            lastMessage: undefined,
            img: data.img,
            level: data.level,
            likes: 0
          };
    }
}
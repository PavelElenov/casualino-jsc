import { Injectable } from "@angular/core";
import { IConversation, IMessageInfo } from "../interfaces/message";
import { IUser } from "../interfaces/user";

@Injectable()
export class ChatFactory{
    createMessageInfoObject(user: IUser, messageText: string, chatName: string): IMessageInfo{
        return {
            writer: {
              username: user.username,
              level: user.level,
              img: user.img,
            },
            text: messageText,
            conversation: chatName,
          };
    }

    createConversation(data:{name:string, img: string, level:number}): IConversation{
        return {
            name: data.name,
            messages: [],
            img: data.img,
            level: data.level,
          };
    }
}
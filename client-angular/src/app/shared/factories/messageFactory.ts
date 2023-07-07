import { Injectable } from "@angular/core";
import { IMessage } from "../interfaces/message";

@Injectable()
export class MessageFactroy{
    createMessage(writer: {username: string, level: number, img:string}, text:string, time:number): IMessage{
        return {
            writer: writer,
            text: text,
            time: time
        }
    }
}
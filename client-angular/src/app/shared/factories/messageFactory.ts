import { Injectable } from '@angular/core';
import { IMessage } from '../interfaces/message';
import { IUser } from '../interfaces/user';

@Injectable()
export class MessageFactroy {
  createMessage(user: IUser, text: string, time: number): IMessage {
    return {
      writer: {
        username: user.username,
        level: user.level,
        img: user.img,
      },
      text: text,
      time: time,
    };
  }
}

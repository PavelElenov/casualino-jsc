import { Injectable } from '@angular/core';
import { IMessage } from '../interfaces/message';
import { ISmallUserInfo } from '../interfaces/user';

@Injectable()
export class MessageFactroy {
  createMessage(user: ISmallUserInfo, text: string, time: number): IMessage {
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

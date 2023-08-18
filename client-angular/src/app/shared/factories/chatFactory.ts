import { Injectable } from '@angular/core';
import { IConversation, IMessage, IMessageInfo } from '../interfaces/message';
import { IUser } from '../interfaces/user';
import { TimeService } from '../services/time/time.service';
import { v4 as uuid } from 'uuid';
import { ICurrentChatInfo } from 'src/app/+store/reducers';

@Injectable()
export class ChatFactory {
  constructor(private timeService: TimeService) {}
  createMessageInfoObject(
    user: IUser,
    messageText: string,
    chatId: string
  ): IMessageInfo {
    return {
      id: uuid(),
      writer: {
        username: user.username,
        level: user.level,
        img: user.img,
      },
      text: messageText,
      time: this.timeService.getCurrentTimeInMinutes(),
      conversationId: chatId,
    };
  }

  createMessage(user: IUser, messageText: string): IMessage {
    return {
      id: uuid(),
      writer: {
        username: user.username,
        level: user.level,
        img: user.img,
      },
      text: messageText,
      time: this.timeService.getCurrentTimeInMinutes(),
    };
  }

  createConversation(data: {
    name: string;
    img: string;
    level: number;
  }): IConversation {
    return {
      name: data.name,
      lastMessage: undefined,
      img: data.img,
      level: data.level,
      likes: 0,
    };
  }

  createCurrentChatInfo(chat: IConversation): ICurrentChatInfo {
    return {
      ...chat,
      lastMessages: [],
      newMessagesCount: 0,
      messagesPerPage: 0,
      lastPage: false,
      waitingForNewLastMessages: false,
    };
  }
}

import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { ChatService } from 'src/app/chat/chat.service';
import { IMessage, IMessageInfo } from '../../interfaces/message';
import { StorageTokenService } from '../storage/storage-token.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: Socket | undefined;
  messages: IMessage[] | undefined;

  constructor(private storage: StorageTokenService, private chatService: ChatService) { }

  connectToServer(){
    this.socket = io("http://localhost:3000", {
      transports: ["websocket"],
      query: {
        token: this.storage.getToken('auth-token'),
      },
    });

    this.socket.on("message", (data: IMessageInfo) => {
      console.log("Hi");
      console.log(data);

      if(data.conversation == this.chatService.currentChat?.name){
        this.messages = this.messages ? [...this.messages!, {writer:data.writer, text: data.text, time:data.time}] : [{writer:data.writer, text: data.text, time:data.time}];
      }
    });
  }

  emitMessage(message: IMessageInfo){
    this.socket?.emit('message', message);

    this.messages = this.messages ? [...this.messages!, {writer:message.writer, text: message.text, time:message.time}] : [{writer:message.writer, text: message.text, time:message.time}];
  }
}

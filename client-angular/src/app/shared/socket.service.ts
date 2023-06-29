import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { StorageTokenService } from './storage-token.service';
import { IMessageInfo } from './interfaces/message';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: Socket | undefined

  constructor(private storage: StorageTokenService) { }

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
    });
  }

  emitMessage(message: string){
    this.socket?.emit('message', message);
  }
}

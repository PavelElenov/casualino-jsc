import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { IMessageInfo } from '../../interfaces/message';
import { StorageTokenService } from '../storage/storage-token.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: Socket | undefined;
  constructor(private storage: StorageTokenService) {}
  connectToServer() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      query: {
        token: this.storage.getToken('auth-token'),
      },
    });
  }

  emitMessage(message: IMessageInfo) {
    this.socket?.emit('message', message);
  }

  on(event: string, listener: (data: any) => void): void {
    this.socket?.on(event, listener);
  }
}

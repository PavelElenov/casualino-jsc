import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { Socket, io } from "socket.io-client";
import { IState } from "src/app/+store";
import { addMessage } from "src/app/+store/actions";
import { ChatService } from "src/app/chat/chat.service";
import { IMessageInfo } from "../../interfaces/message";
import { StorageTokenService } from "../storage/storage-token.service";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  socket: Socket | undefined;

  constructor(
    private storage: StorageTokenService,
    private chatService: ChatService,
    private store: Store<IState>
  ) {}

  connectToServer() {
    this.socket = io("http://localhost:3000", {
      transports: ["websocket"],
      query: {
        token: this.storage.getToken("auth-token"),
      },
    });

    this.socket.on("message", (data: IMessageInfo) => {
      console.log("Hi");
      console.log(data);

      if (data.conversation == this.chatService.currentChat?.name) {
        this.store.dispatch(
          addMessage({
            message: {
              writer: data.writer,
              text: data.text,
              time: data.time,
            },
          })
        );
      }
    });
  }

  emitMessage(message: IMessageInfo) {
    this.socket?.emit("message", message);
  }
}

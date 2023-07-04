import { Injectable, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { Socket, io } from "socket.io-client";
import { IState } from "src/app/+store";
import { addMessage } from "src/app/+store/actions";
import { selectCurrentChat } from "src/app/+store/selectors";
import { IConversation, IMessageInfo, IFullMessageInfo } from "../../interfaces/message";
import { StorageTokenService } from "../storage/storage-token.service";

@Injectable({
  providedIn: "root",
})
export class SocketService implements OnDestroy{
  socket: Socket | undefined;
  currentChat!: IConversation;

  subscriptions$: Subscription[] = [];

  constructor(
    private storage: StorageTokenService,
    private store: Store<IState>
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.map(s => s.unsubscribe());
  }

  connectToServer() {
    this.socket = io("http://localhost:3000", {
      transports: ["websocket"],
      query: {
        token: this.storage.getToken("auth-token"),
      },
    });

    this.socket.on("message", (data: IFullMessageInfo) => {
      const subscription = this.store.select(selectCurrentChat).subscribe(currentChat => {
        if (data.conversation == currentChat.name) {
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

      this.subscriptions$.push(subscription);
      
    });
  }

  emitMessage(message: IMessageInfo) {
    this.socket?.emit("message", message);
  }
}

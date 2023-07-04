import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { ChatService } from "../chat.service";
import { Observable, Subscription } from "rxjs";
import { IConversation, IMessage, IMessageInfo } from "src/app/shared/interfaces/message";
import { NgForm } from "@angular/forms";
import { SocketService } from "src/app/shared/services/socket/socket.service";
import { UserService } from "src/app/shared/services/user/user.service";
import { TimeService } from "src/app/shared/services/time/time.service";
import { IState } from "src/app/+store";
import {Store} from "@ngrx/store";
import { addMessage, setChats, setCurrentChat, setMessages, setUser } from "src/app/+store/actions";
import { selectChats, selectMessages } from "src/app/+store/selectors";
import { StorageTokenService } from "src/app/shared/services/storage/storage-token.service";

@Component({
  selector: "app-chats-list",
  templateUrl: "./chats-list.component.html",
  styleUrls: ["./chats-list.component.scss"],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  chats$: Observable<IConversation[]> | undefined;
  currentChat: IConversation | undefined;
  messages$: Observable<IMessage[]> = this.store.select(selectMessages);
  subscriptions$: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private store: Store<IState>,
    private userService: UserService,
    private storage: StorageTokenService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.map(s => s.unsubscribe());
  }

  ngOnInit() {
    const authToken = this.storage.getToken('auth-token');

    if(authToken){
      const subscription = this.userService.getUserByToken(authToken).subscribe(user => this.store.dispatch(setUser({user})));
      this.subscriptions$.push(subscription);
    }
    const subscription = this.chatService.getAllChats().subscribe(chats => {
      this.store.dispatch(setChats({chats}));
      this.chats$ = this.store.select(selectChats);
    });

    this.subscriptions$.push(subscription);
    this.socketService.connectToServer();
  }

  getCurrentChat(chat: Observable<IConversation>) {
    const subscription$ = chat.subscribe((chat) => {
      this.currentChat = chat;
      this.store.dispatch(setCurrentChat({currentChat: chat}));

      if (this.currentChat!.messages.length > 0) {
        this.store.dispatch(setMessages({messages: this.currentChat!.messages}));
      }
    });

    this.subscriptions$.push(subscription$);
  }

}

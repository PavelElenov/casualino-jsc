import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { IState } from "src/app/+store";
import { addChat, setCurrentChat } from "src/app/+store/actions";
import { selectCurrentChat, selectUser } from "src/app/+store/selectors";
import {
  IConversation,
  IMessage,
  IMessageInfo,
} from "src/app/shared/interfaces/message";
import { IUser } from "src/app/shared/interfaces/user";
import { SocketService } from "src/app/shared/services/socket/socket.service";
import { ChatService } from "../chat.service";

@Component({
  selector: "app-current-chat",
  templateUrl: "./current-chat.component.html",
  styleUrls: ["./current-chat.component.scss"],
})
export class CurrentChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  messages!: IMessage[] | null;
  currentChat!: IConversation;
  subscriptions$: Subscription[] = [];

  user!: IUser;

  constructor(
    private socketService: SocketService,
    private store: Store<IState>,
    private chatService: ChatService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe);
  }
  ngOnInit(): void {
    const subscription = this.store
      .select(selectCurrentChat)
      .subscribe((currentChat) => (this.currentChat = currentChat));

    const subscription2 = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    this.subscriptions$.push(subscription2);
    this.subscriptions$.push(subscription);
  }
  ngAfterViewInit(): void {
    this.goBottomOfMessages();
  }
  submitMessage(form: NgForm) {
    const { message } = form.value;
    form.reset();

    const messageInfo: IMessageInfo = {
      writer: {
        username: this.user.username,
        level: this.user.level,
        img: this.user.img,
      },
      text: message,
      conversation: this.currentChat!.name,
    };

    if(this.currentChat.name == ""){
      const chat: IConversation = {
        name: this.user.username,
        messages: [],
        img: this.user.img,
        level: this.user.level,
      }
      const subscription = this.chatService.addChat(chat)!.subscribe(() => {
        this.store.dispatch(setCurrentChat({currentChat: chat }));
        this.store.dispatch(addChat({chat}));
        messageInfo.conversation = chat.name;
        this.socketService.emitMessage(messageInfo);
        this.goBottomOfMessages();
      });
      this.subscriptions$.push(subscription);
    }else{
      this.socketService.emitMessage(messageInfo);
      this.goBottomOfMessages();
    }
  }
  goBottomOfMessages(): void {
    const messagesDiv: HTMLDivElement = document.getElementById(
      "messages"
    ) as HTMLDivElement;

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

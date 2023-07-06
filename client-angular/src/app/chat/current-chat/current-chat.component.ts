import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { IState } from 'src/app/+store';
import { addChat, setCurrentChat } from 'src/app/+store/actions';
import {
  selectCurrentChat,
  selectMessages,
  selectNewMessages,
  selectUser,
} from 'src/app/+store/selectors';
import {
  IConversation,
  IMessage,
  IMessageInfo,
} from 'src/app/shared/interfaces/message';
import { IUser } from 'src/app/shared/interfaces/user';
import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-current-chat',
  templateUrl: './current-chat.component.html',
  styleUrls: ['./current-chat.component.scss'],
})
export class CurrentChatComponent implements OnInit, OnDestroy, AfterViewInit {
  messages!: IMessage[];
  currentChat!: IConversation;
  subscriptions$: Subscription[] = [];

  user!: IUser;
  newMessages!: number;

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

    const subscription3 = this.store
      .select(selectNewMessages)
      .subscribe((newMessages) => (this.newMessages = newMessages));

    const subscription4 = this.store.select(selectMessages).subscribe(messages => {
      this.messages = messages;
      console.log("Change");
      
    });

    this.subscriptions$.push(subscription4);
    this.subscriptions$.push(subscription3);
    this.subscriptions$.push(subscription2);
    this.subscriptions$.push(subscription);
  }
  ngAfterViewInit(): void {
    console.log("After view init");
    
    this.goToTheBottomOfTheMessages();
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

    if (this.currentChat.name == '') {
      const chat: IConversation = {
        name: this.user.username,
        messages: [],
        img: this.user.img,
        level: this.user.level,
      };
      const subscription = this.chatService.addChat(chat)!.subscribe(() => {
        this.store.dispatch(setCurrentChat({ currentChat: chat }));
        this.store.dispatch(addChat({ chat }));
        messageInfo.conversation = chat.name;
        this.socketService.emitMessage(messageInfo);
        this.goToTheBottomOfTheMessages();
      });
      this.subscriptions$.push(subscription);
    } else {
      this.socketService.emitMessage(messageInfo);
      this.goToTheBottomOfTheMessages();
    }
  }

  goToTheBottomOfTheMessages(): void {
    const messagesDiv: HTMLDivElement = document.getElementById(
      'messages'
    ) as HTMLDivElement;

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

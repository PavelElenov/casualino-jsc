import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Observable, Subscription } from 'rxjs';
import { IConversation, IMessage, IMessageInfo } from 'src/app/shared/interfaces/message';
import { NgForm } from '@angular/forms';
import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { IState } from 'src/app/+store';
import {Store} from '@ngrx/store';
import { addMessage, setMessages } from 'src/app/+store/actions';
import { selectMessages } from 'src/app/+store/selectors';

@Component({
  selector: 'app-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  chats$: Observable<IConversation[]> | undefined;
  currentChat: IConversation | undefined;
  messages$: Observable<IMessage[]> = this.store.select(selectMessages);
  subscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,

    private userService: UserService,
    private timeService: TimeService,
    private store: Store<IState>
  ) {}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.chats$ = this.chatService.getAllChats();
  }

  changeCurrentChat(chat: Observable<IConversation>) {
    const subscription$ = chat.subscribe((chat) => {
      this.currentChat = chat;
      this.chatService.currentChat = chat;

      if (this.currentChat!.messages.length > 0) {
        this.store.dispatch(setMessages({messages: this.currentChat!.messages}));
      }
    });

    this.subscription.add(subscription$);
  }

  submitMessage(form: NgForm) {
    const { message } = form.value;
    form.reset();
    
    const messageInfo: IMessageInfo = {
      writer: {
        username: this.userService.user!.username,
        level: this.userService.user!.level,
        img: this.userService.user!.img,
      },
      text: message,
      time: this.timeService.getCurrentTimeInMinutes(),
      conversation: this.currentChat!.name
    };

    this.socketService.emitMessage(messageInfo);
    this.store.dispatch(addMessage({message: {
      writer: messageInfo.writer,
      text: message,
      time: messageInfo.time
    }}));
  }
}

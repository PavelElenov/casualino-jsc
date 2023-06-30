import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Observable } from 'rxjs';
import { IConversation, IMessage, IMessageInfo } from 'src/app/shared/interfaces/message';
import { NgForm } from '@angular/forms';
import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { TimeService } from 'src/app/shared/services/time/time.service';

@Component({
  selector: 'app-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  chats$: Observable<IConversation[]> | undefined;
  currentChat: IConversation | undefined;
  messages: IMessage[] | undefined;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,

    private userService: UserService,
    private timeService: TimeService
  ) {}
  ngOnDestroy(): void {}

  ngOnInit() {
    this.chats$ = this.chatService.getAllChats();
    this.socketService.connectToServer();
  }

  changeCurrentChat(chat: Observable<IConversation>) {
    chat.subscribe((chat) => {
      this.currentChat = chat;
      this.chatService.currentChat = chat;

      if (this.currentChat!.messages.length > 0) {
        this.messages = this.currentChat!.messages;
      }
    });
  }

  submitMessage(form: NgForm) {
    const { message } = form.value;
    form.reset();
    console.log(this.userService.user);
    
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
    this.messages = this.messages ? [...this.messages!, messageInfo] : [messageInfo];
  }
}

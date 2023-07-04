import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { IState } from 'src/app/+store';
import { addMessage } from 'src/app/+store/actions';
import { selectCurrentChat } from 'src/app/+store/selectors';
import { IConversation, IMessage, IMessageInfo } from 'src/app/shared/interfaces/message';
import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { UserService } from 'src/app/shared/services/user/user.service';

@Component({
  selector: 'app-current-chat',
  templateUrl: './current-chat.component.html',
  styleUrls: ['./current-chat.component.scss']
})
export class CurrentChatComponent implements OnInit, OnDestroy, AfterViewInit{
  @Input()
  messages!: IMessage[] | null;
  currentChat!:IConversation;
  subscriptions$: Subscription[] = [];

  constructor(private userService: UserService, private timeService: TimeService, private socketService: SocketService, private store: Store<IState>){}
  ngOnDestroy(): void {
    this.subscriptions$.map(s => s.unsubscribe);
  }
  ngOnInit(): void {
    const subscription = this.store.select(selectCurrentChat).subscribe(currentChat => this.currentChat = currentChat);
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

  goBottomOfMessages(): void{
    const messagesDiv:HTMLDivElement = document.getElementById('messages') as HTMLDivElement;
    console.log(messagesDiv);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

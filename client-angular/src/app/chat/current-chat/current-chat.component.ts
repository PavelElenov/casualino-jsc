import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { IState } from 'src/app/+store';
import {
  selectCurrentChat,
  selectMessages,
  selectNewMessages,
  selectUser,
} from 'src/app/+store/selectors';
import { IConversation, IMessage } from 'src/app/shared/interfaces/message';
import { IUser } from 'src/app/shared/interfaces/user';
import { ChatService } from '../chat.service';
import {
  clearNewMessages,
  setCurrentChat,
  substractOneNewMessage,
} from 'src/app/+store/actions';

@Component({
  selector: 'app-current-chat',
  templateUrl: './current-chat.component.html',
  styleUrls: ['./current-chat.component.scss'],
})
export class CurrentChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() closeCurrentChatEmitter = new EventEmitter();
  messages!: IMessage[];
  currentChat!: IConversation;
  subscriptions$: Subscription[] = [];
  user!: IUser;
  newMessages!: number;

  constructor(private store: Store<IState>, private chatService: ChatService) {}
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe);
    const currentChatMessages: HTMLElement =
      document.getElementById('messages')!;
    currentChatMessages.style.removeProperty("scroll-behaviour");
  }
  ngOnInit(): void {
    const subscription = this.store
      .select(selectCurrentChat)
      .subscribe((currentChat) => (this.currentChat = currentChat!));

    const subscription2 = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    const subscription3 = this.store
      .select(selectNewMessages)
      .subscribe((newMessages) => (this.newMessages = newMessages));

    const subscription4 = this.store
      .select(selectMessages)
      .subscribe((messages) => {
        this.messages = messages;

        messages[messages.length - 1].writer.username == this.user.username &&
          requestAnimationFrame(() => this.goToTheBottomOfTheMessages());
      });

    this.subscriptions$.push(subscription4);
    this.subscriptions$.push(subscription3);
    this.subscriptions$.push(subscription2);
    this.subscriptions$.push(subscription);
  }
  ngAfterViewInit(): void {
    this.goToTheBottomOfTheMessages();
    const currentChatMessages: HTMLElement =
          document.getElementById('messages')!;
        currentChatMessages.style.scrollBehavior = 'smooth';
  }
  submitMessage(form: NgForm) {
    const { message } = form.value;
    form.reset();
    this.chatService.submitMessage(message);
  }
  goToTheBottomOfTheMessages(): void {
    const messagesDiv: HTMLDivElement = document.getElementById(
      'messages'
    ) as HTMLDivElement;

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
  readAllNewMessages(): void {
    this.store.dispatch(clearNewMessages());
    this.goToTheBottomOfTheMessages();
  }

  scrolling(): void {
    if (this.newMessages > 0) {
      const messagesDiv: HTMLElement = document.getElementById('messages')!;
      const element: HTMLElement = messagesDiv.childNodes[
        messagesDiv.childNodes.length - this.newMessages - 5
      ] as HTMLElement;

      const eleTop = element.offsetTop;
      const eleBottom = eleTop + element.offsetHeight;

      const containerTop = messagesDiv.scrollTop;
      const containerBottom = containerTop + messagesDiv.clientHeight;

      if (eleTop >= containerTop && eleBottom <= containerBottom) {
        this.store.dispatch(substractOneNewMessage());
      }
    }
  }

  emitCloseCurrentChat(): void {
    const currentChatContainer: HTMLElement =
      document.getElementById('current-chat')!;
    currentChatContainer.setAttribute('closing', '');
    console.log('Close current chat');

    currentChatContainer.addEventListener(
      'animationend',
      () => {
        currentChatContainer.removeAttribute('closing');
        this.closeCurrentChatEmitter.emit();
      },
      { once: true }
    );
  }
}

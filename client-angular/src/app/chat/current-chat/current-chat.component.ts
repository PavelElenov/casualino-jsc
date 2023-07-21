import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() closeCurrentChatEmitter = new EventEmitter();
  @ViewChild('currentChat', { static: false })
  currentChatContainer!: ElementRef;
  @ViewChild('messages', { static: false }) messagesContainer!: ElementRef;
  messages!: IMessage[];
  currentChat!: IConversation;
  subscriptions$: Subscription[] = [];
  user!: IUser;
  newMessages!: number;

  constructor(
    private store: Store<IState>,
    private chatService: ChatService,
    private changeDetection: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe);
  }
  ngOnInit(): void {
    const selectCurrentChatSubscription = this.store
      .select(selectCurrentChat)
      .subscribe((currentChat) => {
        this.currentChat = currentChat!;
      });

    const selectUserSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    const selectNewMessagesSubscription = this.store
      .select(selectNewMessages)
      .subscribe((newMessages) => (this.newMessages = newMessages));

    const selectMessagesSubscription = this.store
      .select(selectMessages)
      .subscribe((messages) => {
        this.messages = messages;

        if (messages.length > 0) {
          messages[messages.length - 1].writer.username == this.user.username &&
            requestAnimationFrame(() => this.goToTheBottomOfTheMessages());
        }
        this.changeDetection.detectChanges();
      });

    this.subscriptions$.push(selectCurrentChatSubscription);
    this.subscriptions$.push(selectUserSubscription);
    this.subscriptions$.push(selectNewMessagesSubscription);
    this.subscriptions$.push(selectMessagesSubscription);
  }
  ngAfterViewInit(): void {
    this.currentChatContainer.nativeElement.classList.add('open');

    this.goToTheBottomOfTheMessages();
    const currentChatMessages: HTMLElement =
      document.getElementById('messages')!;
    currentChatMessages.style.scrollBehavior = 'smooth';
    this.renderer.setProperty(
      this.messagesContainer,
      'scroll-behavior',
      'smooth'
    );
  }

  trackByMessage(index: number, item: IMessage): string {
    return item.text;
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

    currentChatContainer.classList.remove('open');
    currentChatContainer.classList.add('close');

    currentChatContainer.addEventListener(
      'animationend',
      () => {
        currentChatContainer.classList.remove('close');
        const currentChatMessages: HTMLElement =
          document.getElementById('messages')!;
        currentChatMessages.style.removeProperty('scroll-behaviour');
        this.closeCurrentChatEmitter.emit();
      },
      { once: true }
    );
  }
}

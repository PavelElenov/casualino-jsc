import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
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
  @ViewChild('messagesContainer', { static: false })
  messagesContainer!: ElementRef;
  allMessages: IMessage[] = [];
  currentChat!: IConversation;
  subscriptions$: Subscription[] = [];
  user!: IUser;
  newMessages!: number;
  lastMessageElement: HTMLElement | undefined;
  lastMessage: IMessage | undefined;
  lastScrollTop!: number;
  isOpen: boolean = false;

  constructor(
    private store: Store<IState>,
    private chatService: ChatService,
    private changeDetection: ChangeDetectorRef
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe);
  }
  ngOnInit(): void {
    const selectCurrentChatSubscription = this.store
      .select(selectCurrentChat)
      .subscribe((currentChat) => {
        if (currentChat) {
          this.currentChat = currentChat!;
          this.chatService
            .getLastMessages(this.currentChat.id)
            .subscribe(
              (lastMessages) => (this.lastMessage = lastMessages[0])
            );
        }
      });

    const selectUserSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    const selectNewMessagesSubscription = this.store
      .select(selectNewMessages)
      .subscribe((newMessages) => (this.newMessages = newMessages));

    this.subscriptions$.push(selectCurrentChatSubscription);
    this.subscriptions$.push(selectUserSubscription);
    this.subscriptions$.push(selectNewMessagesSubscription);
  }
  ngAfterViewInit(): void {
    this.isOpen = true;

    const selectMessagesSubscription = this.store
      .select(selectMessages)
      .subscribe((messages) => {
        if (this.allMessages.length == 0) {
          requestAnimationFrame(() => this.goToTheBottomOfTheMessages());
        }

        this.allMessages = messages;

        this.changeDetection.detectChanges();
      });
    this.subscriptions$.push(selectMessagesSubscription);
  }

  trackByMessage(index: number, item: IMessage): string {
    return item.id;
  }

  submitMessage(form: NgForm) {
    const { message } = form.value;
    form.reset();
    this.chatService.submitMessage(message);
    requestAnimationFrame(() => this.goToTheBottomOfTheMessages());
    // doesn't work
  }

  goToTheBottomOfTheMessages(): void {
    this.messagesContainer.nativeElement.scrollTop =
      this.messagesContainer.nativeElement.scrollHeight;

    this.lastScrollTop = this.messagesContainer.nativeElement.scrollTop;
  }

  readAllNewMessages(): void {
    this.store.dispatch(clearNewMessages());
    this.goToTheBottomOfTheMessages();
  }

  scrolling(): void {
    const currentScrollTop = this.messagesContainer.nativeElement.scrollTop;

    if (currentScrollTop < this.lastScrollTop) {
      this.checkForTopMessageIsVisible();
    } else {
      this.checkForNewMessages();
    }
    this.lastScrollTop = currentScrollTop;
  }

  checkForTopMessageIsVisible() {
    if (
      this.lastMessage &&
      this.messagesContainer.nativeElement.scrollTop === 0
    ) {
      this.getLastMessages();
    }
  }

  getLastMessages() {
    const getLastMessagesSubscription: Subscription = this.chatService
      .getLastMessages(this.currentChat.id, this.lastMessage?.id)
      .subscribe((lastMessages) => {
        const lastMessageElement: HTMLElement = document.getElementById(this.lastMessage!.id)!;
        this.messagesContainer.nativeElement.scrollTop = lastMessageElement.offsetTop - 30;
        this.lastMessage = lastMessages[0];
      });

    this.subscriptions$.push(getLastMessagesSubscription);
  }

  checkForNewMessages() {
    if (this.newMessages > 0) {
      const element: HTMLElement = this.messagesContainer.nativeElement
        .childNodes[
        this.messagesContainer.nativeElement.childNodes.length -
          this.newMessages -
          5
      ] as HTMLElement;

      this.elementIsVisible(element) &&
        this.store.dispatch(substractOneNewMessage());
    }
  }

  elementIsVisible(element: HTMLElement): boolean {
    const eleTop = element.offsetTop;
    const eleBottom = eleTop + element.offsetHeight;

    const containerTop = this.messagesContainer.nativeElement.scrollTop;
    const containerBottom =
      containerTop + this.messagesContainer.nativeElement.clientHeight;

    if (eleTop >= containerTop && eleBottom <= containerBottom) {
      return true;
    }
    return false;
  }

  emitCloseCurrentChat(): void {
    this.currentChatContainer.nativeElement.classList.remove('open');
    this.currentChatContainer.nativeElement.classList.add('close');

    this.currentChatContainer.nativeElement.addEventListener(
      'animationend',
      () => {
        this.currentChatContainer.nativeElement.classList.remove('close');
        this.closeCurrentChatEmitter.emit();
      },
      { once: true }
    );
  }
}

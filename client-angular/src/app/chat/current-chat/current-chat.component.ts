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
import { filter, Subscription, take } from 'rxjs';
import { IState } from 'src/app/+store';
import {
  selectCurrentChat,
  selectLastPage,
  selectMessages,
  selectMessagesPerPage,
  selectNewMessages,
  selectUser,
  selectWaitingForLastMessages,
} from 'src/app/+store/selectors';
import { IMessage } from 'src/app/shared/interfaces/message';
import { IUser } from 'src/app/shared/interfaces/user';
import { ChatService } from '../chat.service';
import { ICurrentChatInfo } from 'src/app/+store/reducers';

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
  messagesContainerRef!: ElementRef;
  messagesContainer!: HTMLElement;
  allMessages: IMessage[] = [];
  currentChat: ICurrentChatInfo | null = null;
  subscriptions$: Subscription[] = [];
  user!: IUser;
  newMessages!: number;
  lastMessage: IMessage | undefined;
  lastScrollTop!: number;
  currentChatState: string = '';
  messageError: string | undefined = undefined;
  sendingMessage!: IMessage;
  animatingScroll: boolean = false;
  waitingForNewLastMessages!: boolean;
  messagesPerPage!: number;
  lastPage!: boolean;

  constructor(
    private store: Store<IState>,
    private chatService: ChatService,
    private changeDetection: ChangeDetectorRef
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }
  ngOnInit(): void {
    const selectUserSubscription = this.store
      .select(selectUser)
      .subscribe((user) => {
        this.user = user;
      });

    const selectCurrentChatSubscription = this.store
      .select(selectCurrentChat)
      .pipe(
        filter((currentChat) => currentChat != null),
        take(1)
      )
      .subscribe((currentChat) => {
        this.currentChat = currentChat!;

        if (currentChat.lastMessages.length === 0) {
          const lastMessagesSubscription = this.chatService
            .getLastMessages(this.currentChat.id!)
            .subscribe(({ lastMessages }) => {
              this.lastMessage = lastMessages[0];
            });
          this.subscriptions$.push(lastMessagesSubscription);
        }else{
          this.lastMessage = currentChat.lastMessages[0];
        }
      });

    const selectNewMessagesSubscription = this.store
      .select(selectNewMessages)
      .subscribe((newMessages) => {
        this.newMessages = newMessages;
        this.changeDetection.detectChanges();
      });

    const selectMessagesPerPageSubscription = this.store
      .select(selectMessagesPerPage)
      .subscribe((messagesPerPage) => {
        this.messagesPerPage = messagesPerPage!;
      });

    const selectLastPageSubscription = this.store
      .select(selectLastPage)
      .subscribe((lastPageValue) => {
        this.lastPage = lastPageValue;
      });

    const selectWaitingForLastMessagesSubscription = this.store
      .select(selectWaitingForLastMessages)
      .subscribe((value) => {
        this.waitingForNewLastMessages = value;
      });

    this.subscriptions$.push(selectCurrentChatSubscription);
    this.subscriptions$.push(selectUserSubscription);
    this.subscriptions$.push(selectNewMessagesSubscription);
    this.subscriptions$.push(selectMessagesPerPageSubscription);
    this.subscriptions$.push(selectWaitingForLastMessagesSubscription);
    this.subscriptions$.push(selectLastPageSubscription);
  }
  ngAfterViewInit(): void {
    this.currentChatState = 'open';
    requestAnimationFrame(() => (this.animatingScroll = true));
    this.messagesContainer = this.messagesContainerRef.nativeElement;

    const selectMessagesSubscription = this.store
      .select(selectMessages)
      .subscribe((messages) => {
        messages.length > 0 &&
          this.scrollToBottomOfMessageContainerOrAddNewMessage(messages);

        if (messages.length < this.messagesPerPage) {
          this.chatService.setLastPage();
        }

        this.allMessages = messages;

        this.changeDetection.detectChanges();
      });
    this.subscriptions$.push(selectMessagesSubscription);
  }

  scrollToBottomOfMessageContainerOrAddNewMessage(messages: IMessage[]) {
    if (this.allMessages.length === 0) {
      // first time when current chat is open
      requestAnimationFrame(() =>
        this.scrollTo(
          this.messagesContainer,
          this.messagesContainer.scrollHeight
        )
      );
    } else {
      if (
        messages[messages.length - 1] !==
        this.allMessages[this.allMessages.length - 1]
      ) {
        // if have new message
        if (this.isClientAtTheBottomOfElement(this.messagesContainer)) {
          requestAnimationFrame(() =>
            this.scrollTo(
              this.messagesContainer,
              this.messagesContainer.scrollHeight,
              true
            )
          );
        } // when have new message and client is at bottom of messages
        else {
          if (
            !this.isTheWriterOfTheMessageCurrentUser(
              messages[messages.length - 1]
            )
          ) {
            // if writer of message isn't a current user
            this.chatService.addNewMessage();
          } else {
            requestAnimationFrame(() => {
              this.scrollTo(
                this.messagesContainer,
                this.messagesContainer.scrollHeight,
                true
              );
            });
          }
        }
      }
    }
  }

  trackByMessage(index: number, item: IMessage): string {
    return item.id;
  }

  isTheWriterOfTheMessageCurrentUser(message: IMessage): boolean {
    return message.writer.username === this.user.username;
  }

  isClientAtTheBottomOfElement(element: HTMLElement): boolean {
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      return true;
    }
    return false;
  }

  scrollTo(element: HTMLElement, amountPx: number, animated: boolean = false) {
    this.animatingScroll = animated;
    requestAnimationFrame(() => {
      element.scrollTop = amountPx;
      this.lastScrollTop = amountPx;
    });
  }

  submitMessage(form: NgForm) {
    const { messageText } = form.value;
    form.reset();

    try {
      const message: IMessage = this.chatService.createMessage(
        this.user,
        messageText
      );

      this.sendingMessage = message;

      this.chatService.addMessage(message);

      this.chatService.submitMessage(message);
    } catch (err: any) {
      this.messageError = err.message;
    }
  }

  resendMesssage() {
    this.messageError = undefined;
    this.chatService.submitMessage(this.sendingMessage);
  }

  readAllNewMessages(): void {
    this.chatService.clearNewMessages();
    this.scrollTo(this.messagesContainer, this.messagesContainer.scrollHeight);
  }

  scrolling(): void {
    const currentScrollTop = this.messagesContainer.scrollTop;

    if (currentScrollTop < this.lastScrollTop) {
      this.checkForTopMessageIsVisible();
    } else {
      this.checkForNewMessages();
    }
    this.lastScrollTop = currentScrollTop;
  }

  checkForTopMessageIsVisible() {
    if (this.lastMessage && this.messagesContainer.scrollTop === 0) {
      this.getLastMessages();
    }
  }

  getLastMessages() {
    if (!this.waitingForNewLastMessages && !this.lastPage) {
      this.chatService.setWaitingForLastMessages(true);

      const getLastMessagesSubscription: Subscription = this.chatService
        .getLastMessages(this.currentChat!.id!, this.lastMessage?.id)
        .subscribe(({ lastMessages }) => {
          this.chatService.setWaitingForLastMessages(false);

          if (this.lastMessage) {
            const lastMessageElement: HTMLElement = document.getElementById(
              this.lastMessage!.id
            )!;

            this.scrollTo(
              this.messagesContainer,
              lastMessageElement.offsetTop - 30
            );

            this.lastMessage = lastMessages[0];
          }
        });

      this.subscriptions$.push(getLastMessagesSubscription);
    }
  }

  checkForNewMessages() {
    if (this.newMessages > 0) {
      const element: HTMLElement = this.messagesContainer.children[
        this.messagesContainer.childNodes.length - this.newMessages
      ] as HTMLElement;

      this.elementIsVisible(element) &&
        this.chatService.substractOneNewMessage();
    }
  }

  elementIsVisible(element: HTMLElement): boolean {
    const eleTop = element.offsetTop;
    const eleBottom = eleTop + element.offsetHeight;

    const containerTop = this.messagesContainer.scrollTop;
    const containerBottom = containerTop + this.messagesContainer.clientHeight;

    if (eleTop >= containerTop && eleBottom <= containerBottom) {
      return true;
    }
    return false;
  }

  emitCloseCurrentChat(): void {
    this.currentChatState = 'close';

    this.currentChatContainer.nativeElement.addEventListener(
      'animationend',
      () => {
        this.currentChatState = '';
        this.chatService.clearCurrentChat();
        this.closeCurrentChatEmitter.emit();
      },
      { once: true }
    );
  }
}

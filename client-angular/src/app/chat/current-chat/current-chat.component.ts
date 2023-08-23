import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
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
  selectLastMessages,
  selectLastPage,
  selectMessageError,
  selectMessagesPerPage,
  selectNewMessages,
  selectOldestMessages,
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
  @Input() currentChatId!: string;
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
  messageError!: string | null;
  sendingMessage!: IMessage;
  animatingScroll: boolean = false;
  waitingForNewMessages!: boolean;
  messagesPerPage!: number;
  lastPage!: boolean;
  isOldestMessages: boolean = false;
  lastOrOldestMessagesStateForButtonText: string = 'go to oldest messages';

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
      .select(selectCurrentChat(this.currentChatId))
      .pipe(filter((currentChat) => currentChat != null))
      .subscribe((currentChat) => {
        this.currentChat = currentChat!;
        this.chatService.setCurrentChat(currentChat);

        if (currentChat.lastMessages.length === 0) {
          const lastMessagesSubscription = this.chatService
            .getLastMessages(this.currentChat.id!)
            .subscribe(({ lastMessages }) => {
              this.lastMessage = lastMessages[0];
            });
          this.subscriptions$.push(lastMessagesSubscription);
        } else if (!this.isOldestMessages && !this.lastMessage) {
          this.lastMessage = currentChat.lastMessages[0];
        }
      });

    const selectNewMessagesSubscription = this.store
      .select(selectNewMessages(this.currentChatId))
      .subscribe((newMessages) => {
        this.newMessages = newMessages;
        this.changeDetection.detectChanges();
      });

    const selectMessagesPerPageSubscription = this.store
      .select(selectMessagesPerPage(this.currentChatId))
      .subscribe((messagesPerPage) => {
        this.messagesPerPage = messagesPerPage!;
      });

    const selectLastPageSubscription = this.store
      .select(selectLastPage(this.currentChatId))
      .subscribe((lastPageValue) => {
        this.lastPage = lastPageValue;
      });

    const selectWaitingForLastMessagesSubscription = this.store
      .select(selectWaitingForLastMessages(this.currentChatId))
      .subscribe((value) => {
        this.waitingForNewMessages = value;
        this.changeDetection.detectChanges();
      });

    const selectMessageErrorSubscription = this.store
      .select(selectMessageError(this.currentChatId))
      .subscribe((messageError) => {
        this.messageError = messageError;
      });

    this.subscriptions$.push(selectCurrentChatSubscription);
    this.subscriptions$.push(selectUserSubscription);
    this.subscriptions$.push(selectNewMessagesSubscription);
    this.subscriptions$.push(selectMessagesPerPageSubscription);
    this.subscriptions$.push(selectWaitingForLastMessagesSubscription);
    this.subscriptions$.push(selectLastPageSubscription);
    this.subscriptions$.push(selectMessageErrorSubscription);
  }
  ngAfterViewInit(): void {
    this.currentChatState = 'open';
    requestAnimationFrame(() => (this.animatingScroll = true));
    this.messagesContainer = this.messagesContainerRef.nativeElement;

    const selectLastMessagesSubscription = this.store
      .select(selectLastMessages(this.currentChatId))
      .subscribe((messages) => {
        if (!this.isOldestMessages) {
          messages.length > 0 &&
            this.scrollToBottomOfMessageContainerOrAddNewMessage(messages);

          if (messages.length < this.messagesPerPage) {
            this.chatService.setLastPage();
          }

          if(!this.checkForOldestAndLastMessagesOverlapping()){
            this.allMessages = messages;
          }

          this.changeDetection.detectChanges();
        }
      });

    const selectOldestMessagesSubscription = this.store
      .select(selectOldestMessages(this.currentChatId))
      .subscribe((messages) => {
        if (this.isOldestMessages) {
          if (messages.length < this.messagesPerPage) {
            this.chatService.setLastPage();
          }

          this.allMessages = messages;
          this.changeDetection.detectChanges();
        }
      });

    this.subscriptions$.push(selectOldestMessagesSubscription);
    this.subscriptions$.push(selectLastMessagesSubscription);
  }

  loadLastOrOldestMessages() {
    if (
      this.lastOrOldestMessagesStateForButtonText === 'go to oldest messages'
    ) {
      this.lastOrOldestMessagesStateForButtonText = 'go to last messages';

      if (this.currentChat?.oldestMessages.length! > 0) {
        this.allMessages = this.currentChat!.oldestMessages;
        this.lastMessage = this.allMessages[this.allMessages.length - 1];
        this.scrollTo(this.messagesContainer, 0, false, true);
      } else {
        this.getOldestMessages();
      }
    } else {
      this.lastOrOldestMessagesStateForButtonText = 'go to oldest messages';
      this.isOldestMessages = false;

      if (this.currentChat!.lastMessages.length > 0) {
        this.allMessages = this.currentChat!.lastMessages;
        this.lastMessage = this.allMessages[0];
        this.scrollTo(
          this.messagesContainer,
          this.messagesContainer.scrollHeight,
          false,
          true
        );
      } else {
        this.getLastMessages();
      }
    }
    this.changeDetection.detectChanges();
  }

  scrollToBottomOfMessageContainerOrAddNewMessage(messages: IMessage[]) {
    if (this.allMessages.length === 0) {
      // first time when current chat is open
      requestAnimationFrame(() => {
        this.scrollTo(
          this.messagesContainer,
          this.messagesContainer.scrollHeight,
          false,
          true
        );
      });
    } else {
      if (
        messages[messages.length - 1] !==
        this.allMessages[this.allMessages.length - 1]
      ) {
        // if have new message
        if (this.isClientAtTheBottomOfElement(this.messagesContainer)) {
          this.scrollTo(
            this.messagesContainer,
            this.messagesContainer.scrollHeight,
            true,
            true
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
                true,
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

  scrollTo(
    element: HTMLElement,
    amountPx: number,
    animated: boolean = false,
    requestAnimation: boolean = false
  ) {
    this.animatingScroll = animated;
    requestAnimation
      ? requestAnimationFrame(() => {
          element.scrollTop = amountPx;
          this.lastScrollTop = amountPx;
        })
      : () => {
          element.scrollTop = amountPx;
          this.lastScrollTop = amountPx;
        };
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
      this.chatService.setMessageError(err.message);
    }
  }

  resendMesssage() {
    this.chatService.setMessageError(null);
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

      if (
        currentScrollTop + this.messagesContainer.clientHeight ===
          this.messagesContainer.scrollHeight &&
        this.isOldestMessages
      ) {
        this.getOldestMessages();
      }
    }
    this.lastScrollTop = currentScrollTop;
  }

  checkForTopMessageIsVisible() {
    if (this.lastMessage && this.messagesContainer.scrollTop === 0) {
      this.getLastMessages();
    }
  }

  scrollToLastElement(){
    console.log(this.lastMessage);
    
    const lastMessageElement: HTMLElement = document.getElementById(
      this.lastMessage!.id
    )!;
    this.scrollTo(
      this.messagesContainer,
      lastMessageElement.offsetTop - 30,
      false,
      true
    );
  }

  getLastMessages() {
    if (!this.waitingForNewMessages && !this.lastPage) {
      if (this.checkForOldestAndLastMessagesOverlapping()) {
        requestAnimationFrame(() => this.scrollToLastElement());
        
      } else {
        this.chatService.setWaitingForLastMessages(true);

        const getLastMessagesSubscription: Subscription = this.chatService
          .getLastMessages(this.currentChat!.id!, this.lastMessage?.id)
          .subscribe(({ lastMessages }) => {
            this.chatService.setWaitingForLastMessages(false);

            requestAnimationFrame(() => {
              if (this.lastMessage) {
                this.scrollToLastElement();

                this.lastMessage = lastMessages[0];
              }
            });
          });

        this.subscriptions$.push(getLastMessagesSubscription);
      }
    }
  }

  getOldestMessages() {
    if (!this.waitingForNewMessages && !this.lastPage) {
      if (!this.checkForOldestAndLastMessagesOverlapping()) {
        this.chatService.setWaitingForLastMessages(true);

        if (!this.isOldestMessages) {
          this.isOldestMessages = true;
          this.lastMessage = undefined;
          this.changeDetection.detectChanges();
        }

        const getOldestMessagesSubscription: Subscription = this.chatService
          .getOldestMessages(
            this.currentChat!.id!,
            this.lastMessage ? this.lastMessage?.id : undefined
          )
          .subscribe((oldestMessages) => {
            this.chatService.setWaitingForLastMessages(false);

            if (this.lastMessage) {
              const lastMessageElement: HTMLElement = document.getElementById(
                this.lastMessage!.id
              )!;
              const bottom =
                this.messagesContainer.offsetHeight -
                lastMessageElement.offsetHeight;

              this.scrollTo(
                this.messagesContainer,
                lastMessageElement.offsetTop - bottom + 30,
                false,
                true
              );
            } else {
              this.scrollTo(this.messagesContainer, 0, false, true);
            }
            this.lastMessage = oldestMessages[oldestMessages.length - 1];
          });

        this.subscriptions$.push(getOldestMessagesSubscription);
      }
    }
  }

  findIndexOfMessage(messages: IMessage[], message: IMessage): number {
    for (let i = 0; i < messages.length; i++) {
      if (messages[0].id === message.id) {
        return i;
      }
    }
    return -1;
  }

  combinateOldestAndLastMessages() {
    const oldestMessages = this.currentChat?.oldestMessages!;
    let lastMessages = this.currentChat!.lastMessages;
    const indexOfLastMessageOfOldestMessages = this.findIndexOfMessage(
      lastMessages,
      oldestMessages[oldestMessages.length - 1]
    );
    console.log(indexOfLastMessageOfOldestMessages);

    lastMessages = lastMessages.slice(
      indexOfLastMessageOfOldestMessages,
      lastMessages.length
    );
    this.allMessages = [...oldestMessages, ...lastMessages];
  }

  checkForOldestAndLastMessagesOverlapping(): boolean {
    const oldestMessages = this.currentChat?.oldestMessages!;
    const lastMessages = this.currentChat!.lastMessages;

    if (oldestMessages.length > 0 && lastMessages.length > 0) {
      const lastMessageOfOldestMessages =
        oldestMessages[oldestMessages.length - 1];
      const isLastMessagesIncludesLastMessageOfOldest = lastMessages.find(
        (m) => m.id === lastMessageOfOldestMessages.id
      );
    
      if (isLastMessagesIncludesLastMessageOfOldest) {
        this.chatService.setLastPage();
        this.combinateOldestAndLastMessages();
        return true;
      }
    }

    return false;
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
        this.isOldestMessages = false;
        this.allMessages = [];
        this.chatService.clearCurrentChat();
        this.closeCurrentChatEmitter.emit();
      },
      { once: true }
    );
  }
}

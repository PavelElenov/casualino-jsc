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
import { debug } from 'src/app/app.module';

@Component({
  selector: 'app-current-chat',
  templateUrl: './current-chat.component.html',
  styleUrls: ['./current-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentChatId!: string;
  @Output() closeCurrentChatEmitter = new EventEmitter();

  @ViewChild('currentChatContainer', { static: false })
  currentChatContainer!: ElementRef;

  @ViewChild('messagesContainer', { static: false })
  messagesContainerRef!: ElementRef;
  messagesContainer!: HTMLElement;
  allMessages: IMessage[] = [];
  currentChat!: ICurrentChatInfo;
  subscriptions$: Subscription[] = [];
  user!: IUser;
  lastMessage: IMessage | undefined;
  lastScrollTop!: number;
  currentChatState: string = '';
  sendingMessage!: IMessage;
  animatingScroll: boolean = false;
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
        this.changeDetection.detectChanges();
      });

    this.subscriptions$.push(selectCurrentChatSubscription);
    this.subscriptions$.push(selectUserSubscription);
  }
  ngAfterViewInit(): void {
    this.currentChatState = 'open';
    requestAnimationFrame(() => (this.animatingScroll = true));
    this.messagesContainer = this.messagesContainerRef.nativeElement;

    const selectLastMessagesSubscription = this.store
      .select(selectLastMessages(this.currentChatId))
      .subscribe((messages) => {
        if (!this.isOldestMessages && messages.length > 0) {
          if (
            this.isNewMessage(messages) &&
            !this.isClientAtTheBottomOfElement(this.messagesContainer) &&
            !this.isTheWriterOfTheMessageCurrentUser(
              messages[messages.length - 1]
            )
          ) {
            this.chatService.addNewMessage();
          } else if (
            this.isNewMessage(messages) &&
            this.isClientAtTheBottomOfElement(this.messagesContainer)
          ) {
            this.scrollTo(
              this.messagesContainer,
              this.messagesContainer.scrollHeight,
              true,
              true
            );
          } else {
            this.scrollTo(
              this.messagesContainer,
              this.messagesContainer.scrollHeight,
              false,
              true
            );
          }

          if (
            this.allMessages.length === 0 &&
            this.chatService.checkForOldestAndLastMessagesOverlapping(
              this.currentChat.oldestMessages,
              this.currentChat.lastMessages
            )
          ) {
            this.allMessages = this.chatService.concatOldestAndLastMessages(
              this.currentChat.oldestMessages,
              this.currentChat.lastMessages
            );
          } else {
            this.allMessages = messages;
          }

          this.changeDetection.detectChanges();
        }
      });

    const selectOldestMessagesSubscription = this.store
      .select(selectOldestMessages(this.currentChat.id!))
      .subscribe((messages) => {
        if (this.isOldestMessages) {
          this.allMessages = messages;
          this.changeDetection.detectChanges();
        }
      });

    this.subscriptions$.push(selectLastMessagesSubscription);
    this.subscriptions$.push(selectOldestMessagesSubscription);
  }

  loadLastOrOldestMessages() {
    if (
      this.lastOrOldestMessagesStateForButtonText === 'go to oldest messages'
    ) {
      this.lastOrOldestMessagesStateForButtonText = 'go to last messages';

      if (this.currentChat?.oldestMessages.length! > 0) {
        requestAnimationFrame(() => {
          this.loadOldestMessages();
        });
      } else {
        this.getOldestMessages();
      }
    } else {
      this.lastOrOldestMessagesStateForButtonText = 'go to oldest messages';
      this.isOldestMessages = false;

      if (this.currentChat!.lastMessages.length > 0) {
        requestAnimationFrame(() => {
          this.loadLastMessages();
        });
      } else {
        this.getLastMessages();
      }
    }
    this.changeDetection.detectChanges();
  }

  loadOldestMessages() {
    this.allMessages = this.currentChat!.oldestMessages;
    this.lastMessage = this.allMessages[this.allMessages.length - 1];
    this.isOldestMessages = true;
    this.scrollTo(this.messagesContainer, 0, false, true);
  }

  loadLastMessages() {
    this.allMessages = this.currentChat!.lastMessages;
    this.lastMessage = this.allMessages[0];
    setTimeout(() => {
      requestAnimationFrame(() => this.scrollTo(this.messagesContainer, this.messagesContainer.scrollHeight)); //doesn't work
    })
    
  }

  isNewMessage(messages: IMessage[]): boolean {
    if (this.allMessages.length > 0 &&
      messages[messages.length - 1] !==
      this.allMessages[this.allMessages.length - 1]
    ) {
      return true;
    }
    return false;
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
    
    if (requestAnimation) {
      requestAnimationFrame(() => {
        element.scrollTop = amountPx;
        this.lastScrollTop = amountPx;
      });
    } else {
      element.scrollTop = amountPx;
      this.lastScrollTop = amountPx;
    }
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
    this.scrollTo(
      this.messagesContainer,
      this.messagesContainer.scrollHeight,
      true,
      true
    );
  }

  scrolling(): void {
    const currentScrollTop = this.messagesContainer.scrollTop;
    
    if (!this.isOldestMessages && currentScrollTop < this.lastScrollTop) {
      this.checkForTopMessageIsVisible();
    } else if(currentScrollTop > this.lastScrollTop){
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

  checkForLastElementIsVisible(){

  }

  checkForTopMessageIsVisible() {
    if (this.lastMessage && this.messagesContainer.scrollTop === 0) {
      this.getLastMessages();
    }
  }

  scrollToLastElement() {
    const lastMessageElement: HTMLElement = document.getElementById(
      this.lastMessage!.id
    )!;

    this.scrollTo(
      this.messagesContainer,
      lastMessageElement.offsetTop - 30,
      false,
    );
  }

  getLastMessages() {
    if (
      !this.currentChat!.waitingForNewMessages &&
      !this.currentChat!.lastPage
    ) {
      this.chatService.setWaitingForLastMessages(true);

      const getLastMessagesSubscription: Subscription = this.chatService
        .getLastMessages(this.currentChat!.id!, this.lastMessage?.id)
        .subscribe(({ lastMessages }) => {
          this.chatService.setWaitingForLastMessages(false);

          requestAnimationFrame(() => {
            if(this.currentChat.lastPage){
              this.allMessages = lastMessages;
            }

            this.scrollToLastElement();
            this.lastMessage = lastMessages[0];
          });
        });

      this.subscriptions$.push(getLastMessagesSubscription);
    }
  }

  scrollToBottomOfLastElement() {
    const lastMessageElement: HTMLElement = document.getElementById(
      this.lastMessage!.id
    )!;

    const bottom =
      this.messagesContainer.offsetHeight - lastMessageElement.offsetHeight;

    this.scrollTo(
      this.messagesContainer,
      lastMessageElement.offsetTop - bottom + 30,
      false,
      true
    );
  }

  getOldestMessages() {
    if (
      !this.currentChat!.waitingForNewMessages &&
      !this.currentChat!.lastPage
    ) {
      this.chatService.setWaitingForLastMessages(true);

      if (!this.isOldestMessages) {
        this.isOldestMessages = true;
        this.lastMessage = undefined;
      }

      const getOldestMessagesSubscription: Subscription = this.chatService
        .getOldestMessages(
          this.currentChat!.id!,
          this.lastMessage ? this.lastMessage?.id : undefined
        )
        .subscribe((oldestMessages) => {
          this.chatService.setWaitingForLastMessages(false);

          if(this.currentChat.lastPage){
            this.allMessages = oldestMessages;
          }else if (this.lastMessage) {
            this.scrollToBottomOfLastElement();
          } else {
            this.scrollTo(this.messagesContainer, 0);
          }

          this.lastMessage = oldestMessages[oldestMessages.length - 1];
        });

      this.subscriptions$.push(getOldestMessagesSubscription);
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

  checkForNewMessages() {
    if (this.currentChat!.newMessagesCount > 0) {
      const element: HTMLElement = this.messagesContainer.children[
        this.messagesContainer.childNodes.length -
          this.currentChat!.newMessagesCount
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

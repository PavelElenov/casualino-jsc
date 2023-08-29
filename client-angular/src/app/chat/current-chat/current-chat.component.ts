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
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { filter, Subscription, take } from 'rxjs';
import { IState } from 'src/app/+store';
import {
  selectAllMessages,
  selectCurrentChat,
  selectUser,
} from 'src/app/+store/selectors';
import { IMessage } from 'src/app/shared/interfaces/message';
import { IUser } from 'src/app/shared/interfaces/user';
import { ChatService } from '../chat.service';
import { ICurrentChatInfo } from 'src/app/+store/reducers';


interface IAction extends Action{
  chatId: string,
  message: IMessage,
}

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
  lastMessageOfLastMessagesId!: string;

  constructor(
    private store: Store<IState>,
    private chatService: ChatService,
    private changeDetection: ChangeDetectorRef,
    private actionListener: ActionsSubject
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
        this.changeDetection.detectChanges();
      });

    const lastMessagesSubscription = this.chatService
      .getLastMessages(this.currentChatId)
      .pipe(
        filter(({ lastMessages }) => lastMessages.length > 0),
        take(1)
      )
      .subscribe(({ lastMessages }) => {
        this.lastMessage = lastMessages[0];
        this.lastMessageOfLastMessagesId = this.lastMessage.id;

        this.changeDetection.detectChanges();
      });

    this.actionListener
      .pipe(
        filter(
          (action) =>
            action.type === 'Add message to chat'
        )
      )
      .subscribe((action) => {
        const actionObject:IAction = action as IAction;
        const message: IMessage = actionObject.message;
        this.allMessages = [...this.allMessages, message]
         
        if (
          !this.isClientAtTheBottomOfElement(this.messagesContainer) &&
          !this.isTheWriterOfTheMessageCurrentUser(
            message
          )
        ) {
          this.chatService.addNewMessage(this.currentChat.id!);
        } else if (this.isClientAtTheBottomOfElement(this.messagesContainer)) {
          this.scrollTo(
            this.messagesContainer,
            this.messagesContainer.scrollHeight,
            true,
            true
          );
        }
        
        this.changeDetection.detectChanges();
      });

    this.subscriptions$.push(lastMessagesSubscription);
    this.subscriptions$.push(selectCurrentChatSubscription);
    this.subscriptions$.push(selectUserSubscription);
  }
  ngAfterViewInit(): void {
    this.currentChatState = 'open';
    requestAnimationFrame(() => (this.animatingScroll = true));
    this.messagesContainer = this.messagesContainerRef.nativeElement;

    const selectAllMessagesSubscription = this.store
      .select(selectAllMessages(this.currentChatId))
      .subscribe((messages) => {
        if (!this.isOldestMessages && messages.length > 0) {
          if (this.allMessages.length === 0) {
            this.allMessages = messages;
            requestAnimationFrame(() =>
              this.scrollTo(
                this.messagesContainer,
                this.messagesContainer.scrollHeight
              )
            );
          }
        }

        this.changeDetection.detectChanges();
      });

    this.subscriptions$.push(selectAllMessagesSubscription);
  }

  loadLastOrOldestMessages() {
    if (
      this.lastOrOldestMessagesStateForButtonText === 'go to oldest messages'
    ) {
      this.lastOrOldestMessagesStateForButtonText = 'go to last messages';

      if (this.currentChat.oldestMessagesCounter > 0) {
        requestAnimationFrame(() => {
          this.loadOldestMessages();
        });
      } else {
        this.getOldestMessages();
      }
    } else {
      this.lastOrOldestMessagesStateForButtonText = 'go to oldest messages';
      this.isOldestMessages = false;

      if (this.currentChat.lastMessagesCounter > 0) {
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
    if (this.currentChat.lastPage) {
      this.allMessages = this.currentChat.allMessages;
    } else {
      this.allMessages = this.chatService.returnOldestMessages(
        this.currentChat.allMessages,
        this.currentChat.oldestMessagesCounter
      );
    }

    this.lastMessage = this.allMessages[this.allMessages.length - 1];
    this.isOldestMessages = true;
    this.scrollTo(this.messagesContainer, 0, false, true);
    this.changeDetection.detectChanges();
  }

  loadLastMessages() {
    if (this.currentChat.lastPage) {
      this.allMessages = this.currentChat.allMessages;
    } else {
      this.allMessages = this.chatService.returnLastMessages(
        this.currentChat.allMessages,
        this.currentChat.lastMessagesCounter
      );
    }

    this.lastMessage = this.allMessages[0];
    this.lastMessageOfLastMessagesId = this.lastMessage.id;
    this.changeDetection.detectChanges();
    requestAnimationFrame(() =>
      this.scrollTo(this.messagesContainer, this.messagesContainer.scrollHeight)
    );
  }

  isNewMessage(messages: IMessage[]): boolean {
    if (
      this.allMessages.length > 0 &&
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

      this.chatService.addMessage(this.currentChat.id!, message);

      this.chatService.submitMessage(this.currentChat.id!, message);
    } catch (err: any) {
      this.chatService.setMessageError(this.currentChat.id!, err.message);
    }
  }

  resendMesssage() {
    this.chatService.setMessageError(this.currentChat.id!, null);
    this.chatService.submitMessage(this.currentChat.id!, this.sendingMessage);
  }

  readAllNewMessages(): void {
    this.chatService.clearNewMessages(this.currentChat.id!);
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
      if (this.isLastElementVisible()) {
        this.getLastMessages();
      }
    } else if (this.isOldestMessages && currentScrollTop > this.lastScrollTop) {
      this.checkForNewMessages();

      if (
        this.messagesContainer.scrollTop +
          this.messagesContainer.clientHeight ===
        this.messagesContainer.scrollHeight
      ) {
        this.getOldestMessages();
      }
    }
    this.lastScrollTop = currentScrollTop;
  }

  isLastElementVisible(): boolean {
    if (this.lastMessage && this.messagesContainer.scrollTop == 0) {
      return true;
    }
    return false;
  }

  scrollToLastElement() {
    const lastMessageElement: HTMLElement = document.getElementById(
      this.lastMessage!.id
    )!;

    this.scrollTo(this.messagesContainer, lastMessageElement.offsetTop - 30);
  }

  getLastMessages() {
    if (
      !this.currentChat!.waitingForNewMessages &&
      !this.currentChat!.lastPage
    ) {
      this.chatService.setWaitingForLastMessages(this.currentChat.id!, true);

      const getLastMessagesSubscription: Subscription = this.chatService
        .getLastMessages(this.currentChat!.id!, this.lastMessage?.id)
        .subscribe(({ lastMessages }) => {
          this.chatService.setWaitingForLastMessages(
            this.currentChat.id!,
            false
          );
          if (this.currentChat.lastPage) {
            this.allMessages = lastMessages;
          } else {
            this.allMessages = [...lastMessages, ...this.allMessages];
          }
          this.changeDetection.detectChanges();

          this.scrollToLastElement();

          this.lastMessage = lastMessages[0];
          this.lastMessageOfLastMessagesId = this.lastMessage.id;
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
      this.chatService.setWaitingForLastMessages(this.currentChat.id!, true);

      if (!this.isOldestMessages) {
        this.lastMessage = undefined;
      }

      const getOldestMessagesSubscription: Subscription = this.chatService
        .getOldestMessages(
          this.currentChat!.id!,
          this.lastMessageOfLastMessagesId,
          this.lastMessage ? this.lastMessage?.id : undefined
        )
        .subscribe((oldestMessages) => {
          this.chatService.setWaitingForLastMessages(
            this.currentChat.id!,
            false
          );
          console.log(oldestMessages);

          if (this.isOldestMessages) {
            if (this.currentChat.lastPage) {
              this.allMessages = oldestMessages;
            } else {
              this.allMessages = [...this.allMessages, ...oldestMessages];
            }

            this.scrollToBottomOfLastElement();
          } else {
            this.allMessages = oldestMessages;
            this.isOldestMessages = true;
            this.scrollTo(this.messagesContainer, 0, false, true);
          }

          this.lastMessage = oldestMessages[oldestMessages.length - 1];
          this.changeDetection.detectChanges();
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
        this.chatService.substractOneNewMessage(this.currentChat.id!);
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
        this.closeCurrentChatEmitter.emit();
      },
      { once: true }
    );
  }
}

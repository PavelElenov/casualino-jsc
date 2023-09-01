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
  selectCurrentChat,
  selectLastMessagesIdsRead,
  selectOldestMessagesIdsRead,
  selectUser,
} from 'src/app/+store/selectors';
import { IMessage } from 'src/app/shared/interfaces/message';
import { IUser } from 'src/app/shared/interfaces/user';
import { ChatService } from '../chat.service';
import { ICurrentChatInfo } from 'src/app/+store/reducers';
import { SelectorClass } from '../selectorClass';

interface IAction extends Action {
  chatId: string;
  message: IMessage;
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
  lastMessageOfLastMessagesIds!: string;
  isClientAtBottomOfMessages: boolean = false;

  constructor(
    private store: Store<IState>,
    private chatService: ChatService,
    private changeDetection: ChangeDetectorRef,
    private actionListener: ActionsSubject,
    private selector: SelectorClass
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }
  ngOnInit(): void {
    console.log('hi');
    console.log(this.currentChatId);

    this.user = this.selector.select(selectUser);

    const selectCurrentChatSubscription = this.store
      .select(selectCurrentChat(this.currentChatId))
      .pipe(filter((currentChat) => currentChat != null))
      .subscribe((currentChat) => {
        this.currentChat = currentChat!;

        this.changeDetection.detectChanges();
      });

    this.actionListener
      .pipe(filter((action) => action.type === 'Add message to chat'))
      .subscribe((action) => {
        const actionObject: IAction = action as IAction;
        const message: IMessage = actionObject.message;

        if (
          !this.isClientAtBottomOfMessages &&
          !this.isTheWriterOfTheMessageCurrentUser(message)
        ) {
          this.chatService.addNewMessage(this.currentChat.id!);
        } else {
          this.scrollTo({
            element: this.messagesContainer,
            amountPx: this.messagesContainer.scrollHeight,
            animated: true,
            requestAnimation: false,
          });
        }
        this.changeDetection.detectChanges();
      });

    this.subscriptions$.push(selectCurrentChatSubscription);
  }
  ngAfterViewInit(): void {
    this.currentChatState = 'open';
    this.messagesContainer = this.messagesContainerRef.nativeElement;

    if (this.currentChat.lastMessagesIdsRead.length === 0) {
      this.chatService.getLastMessages(this.currentChatId);
    }

    const selectlastMessagesSubscription = this.store
      .select(selectLastMessagesIdsRead, this.currentChatId)
      .subscribe((lastMessages) => {
        if (!this.isOldestMessages && lastMessages.length > 0) {
          if (this.allMessages.length === 0) {
            this.lastMessage = lastMessages[0];
            this.lastMessageOfLastMessagesIds = this.lastMessage.id;

            requestAnimationFrame(() =>
              this.scrollTo({
                element: this.messagesContainer,
                amountPx: this.messagesContainer.scrollHeight,
                animated: false,
                requestAnimation: false,
              })
            );
          }

          if (
            this.allMessages[this.allMessages.length - 1] !==
            lastMessages[lastMessages.length - 1]
          ) {
            this.checkForClientIsAtBottomOfContainer();
          }

          this.allMessages = lastMessages;

          this.changeDetection.detectChanges();
        }
      });

    const selectOldestMessagesSubscription = this.store
      .select(selectOldestMessagesIdsRead, this.currentChatId)
      .subscribe((oldestMessages) => {
        if (this.isOldestMessages && oldestMessages.length > 0) {
          this.allMessages = oldestMessages;

          this.changeDetection.detectChanges();
        }
      });

    this.subscriptions$.push(selectlastMessagesSubscription);
    this.subscriptions$.push(selectOldestMessagesSubscription);
  }

  checkForClientIsAtBottomOfContainer(): void {
    this.isClientAtBottomOfMessages =
      this.messagesContainer.scrollTop + this.messagesContainer.clientHeight ===
      this.messagesContainer.scrollHeight;
  }

  loadLastOrOldestMessages() {
    if (
      this.lastOrOldestMessagesStateForButtonText === 'go to oldest messages'
    ) {
      this.lastOrOldestMessagesStateForButtonText = 'go to last messages';

      if (this.currentChat.oldestMessagesIdsRead.length > 0) {
        requestAnimationFrame(() => {
          this.loadOldestMessages();
        });
      } else {
        this.getOldestMessages();
      }
    } else {
      this.lastOrOldestMessagesStateForButtonText = 'go to oldest messages';
      this.isOldestMessages = false;

      if (this.currentChat.lastMessagesIdsRead.length > 0) {
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
    this.allMessages = this.chatService.getMessagesByIds(
      this.currentChat.oldestMessagesIdsRead
    );

    this.lastMessage = this.allMessages[this.allMessages.length - 1];
    this.isOldestMessages = true;
    this.scrollTo({
      element: this.messagesContainer,
      amountPx: 0,
      animated: false,
      requestAnimation: true,
    });
    this.changeDetection.detectChanges();
  }

  loadLastMessages() {
    this.allMessages = this.chatService.getMessagesByIds(
      this.currentChat.lastMessagesIdsRead
    );

    this.lastMessage = this.allMessages[0];
    this.lastMessageOfLastMessagesIds = this.lastMessage.id;
    this.changeDetection.detectChanges();
    requestAnimationFrame(() =>
      this.scrollTo({
        element: this.messagesContainer,
        amountPx: this.messagesContainer.scrollHeight,
        animated: false,
        requestAnimation: false,
      })
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
    console.log(element.scrollTop + element.clientHeight, element.scrollHeight);

    return element.scrollTop + element.clientHeight === element.scrollHeight;
  }

  scrollTo(data: {
    element: HTMLElement;
    amountPx: number;
    animated: boolean;
    requestAnimation: boolean;
  }) {
    this.animatingScroll = data.animated;

    if (data.requestAnimation) {
      requestAnimationFrame(() => {
        data.element.scrollTop = data.amountPx;
        this.lastScrollTop = data.amountPx;
      });
    } else {
      data.element.scrollTop = data.amountPx;
      this.lastScrollTop = data.amountPx;
    }
    this.changeDetection.detectChanges();
  }

  submitMessage(form: NgForm) {
    const { messageText } = form.value;
    form.reset();

    try {
      const message: IMessage = this.chatService.createMessage(
        this.user,
        messageText,
        this.currentChatId
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
    this.scrollTo({
      element: this.messagesContainer,
      amountPx: this.messagesContainer.scrollHeight,
      animated: true,
      requestAnimation: true,
    });
  }

  scrolling(): void {
    const currentScrollTop = this.messagesContainer.scrollTop;

    if (!this.isOldestMessages && currentScrollTop < this.lastScrollTop) {
      if (this.isLastElementVisible()) {
        this.getLastMessages();
      }
    } else if (currentScrollTop > this.lastScrollTop) {
      this.checkForNewMessages();

      if (
        this.isOldestMessages &&
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
    return this.lastMessage != null && this.messagesContainer.scrollTop == 0;
  }

  scrollToLastElement() {
    const lastMessageElement: HTMLElement = document.getElementById(
      this.lastMessage!.id
    )!;

    this.scrollTo({
      element: this.messagesContainer,
      amountPx: lastMessageElement.offsetTop - 30,
      animated: false,
      requestAnimation: false,
    });
  }

  getLastMessages() {
    if (
      !this.currentChat!.waitingForNewMessages &&
      !this.currentChat!.lastPage
    ) {
      this.chatService
        .getLastMessages(this.currentChat!.id!, this.lastMessage?.id)
        .pipe(take(1))
        .subscribe((lastMessages) => {
          this.scrollToLastElement();

          this.lastMessage = lastMessages[0];
          this.lastMessageOfLastMessagesIds = this.lastMessage.id;
        });
    }
  }

  scrollToBottomOfLastElement() {
    const lastMessageElement: HTMLElement = document.getElementById(
      this.lastMessage!.id
    )!;

    const bottom =
      this.messagesContainer.offsetHeight - lastMessageElement.offsetHeight;

    this.scrollTo({
      element: this.messagesContainer,
      amountPx: lastMessageElement.offsetTop - bottom + 30,
      animated: false,
      requestAnimation: true,
    });
  }

  getOldestMessages() {
    if (
      !this.currentChat!.waitingForNewMessages &&
      !this.currentChat!.lastPage
    ) {
      if (!this.isOldestMessages) {
        this.lastMessage = undefined;
      }

      const getOldestMessagesSubscription: Subscription = this.chatService
        .getOldestMessages(
          this.currentChat!.id!,
          this.lastMessageOfLastMessagesIds,
          this.lastMessage ? this.lastMessage?.id : undefined
        )
        .subscribe((oldestMessages) => {
          console.log(oldestMessages);

          if (!this.isOldestMessages) {
            this.isOldestMessages = true;
            this.allMessages = oldestMessages;
            this.scrollTo({
              element: this.messagesContainer,
              amountPx: 0,
              animated: false,
              requestAnimation: true,
            });
          } else {
            this.scrollToBottomOfLastElement();
          }

          this.lastMessage = this.allMessages[this.allMessages.length - 1];
          this.changeDetection.detectChanges();
        });

      this.subscriptions$.push(getOldestMessagesSubscription);
    }
  }

  checkForNewMessages() {
    if (this.currentChat!.newMessagesCount > 0) {
      const element: HTMLElement = this.messagesContainer.children[
        this.messagesContainer.children.length -
          this.currentChat!.newMessagesCount -
          1
      ] as HTMLElement;

      if (this.elementIsVisible(element)) {
        this.chatService.substractOneNewMessage(this.currentChat.id!);
      }
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

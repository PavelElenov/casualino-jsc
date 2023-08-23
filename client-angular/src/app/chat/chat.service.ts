import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
import { HttpService } from '../shared/services/http/http.service';
import { StorageTokenService } from '../shared/services/storage/storage-token.service';
import {
  IConversation,
  IFullMessageInfo,
  IMessage,
  IMessageInfo,
} from '../shared/interfaces/message';
import { Observable, Subject, Subscription } from 'rxjs';
import { SocketService } from '../shared/services/socket/socket.service';
import {
  selectChatById,
  selectMessagesPerPage,
  selectUser,
} from '../+store/selectors';
import { Store } from '@ngrx/store';
import { IState } from '../+store';
import {
  addChat,
  addMessage,
  addNewMessage,
  clearNewMessages,
  deleteChat,
  deleteMessage,
  likeChat,
  setChats,
  setError,
  substractOneNewMessage,
  replaceMessageById,
  setMessagesPerPage,
  addLastMessages,
  setWaitingForMessages,
  setLastPageEqualsToTrue,
  clearChat,
  setSelectedChatId,
  addMessageToChatByChatId,
  addOldestMessages,
  setMessageError,
} from '../+store/actions';
import { IUser } from '../shared/interfaces/user';
import { ChatFactory } from '../shared/factories/chatFactory';
import { Router } from '@angular/router';
import { take } from 'rxjs';

interface IGetLastMessages {
  lastMessages: IMessage[];
  messagesPerPage: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  subscriptions$: Subscription[] = [];
  user!: IUser;
  messages!: IMessage[];
  currentChat!: IConversation;
  sendMessagesCount: number = 0;
  messagesPerPage: number | null = null;
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private socketService: SocketService,
    private store: Store<IState>,
    private chatFactory: ChatFactory,
    private router: Router,
  ) {
    const userSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    if (this.currentChat) {
      const messagePerPageSubscription = this.store
        .select(selectMessagesPerPage(this.currentChat.id!))
        .subscribe((messagesPerPage) => {
          this.messagesPerPage = messagesPerPage;
        });

      this.subscriptions$.push(messagePerPageSubscription);
    }

    this.subscriptions$.push(userSubscription);
  }
  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }

  setWaitingForLastMessages(value: boolean) {
    this.store.dispatch(
      setWaitingForMessages({ chatId: this.currentChat.id!, value })
    );
  }

  setLastPage() {
    this.store.dispatch(
      setLastPageEqualsToTrue({ chatId: this.currentChat.id! })
    );
  }

  likeChat(conversation: IConversation) {
    const chat = { ...conversation, likes: conversation.likes + 1 };
    const likeSubscription = this.httpService
      .post(
        `/conversations/${conversation.name}/like`,
        {},
        this.storage.getToken('auth-token')!
      )
      .subscribe(() => {
        this.store.dispatch(likeChat({ chat }));
      });
    this.subscriptions$.push(likeSubscription);
  }

  clearNewMessages() {
    this.store.dispatch(clearNewMessages({ chatId: this.currentChat.id! }));
  }

  clearCurrentChat() {
    this.store.dispatch(clearChat({chatId: this.currentChat.id!}));
  }

  substractOneNewMessage() {
    this.store.dispatch(
      substractOneNewMessage({ chatId: this.currentChat.id! })
    );
  }

  getLastMessages(
    conversationId: string,
    lastMessageId?: string
  ): Observable<IGetLastMessages> {
    const url = lastMessageId
      ? `/conversations/${conversationId}/lastMessages?lastMessageId=${lastMessageId}`
      : `/conversations/${conversationId}/lastMessages`;

    const subject: Subject<IGetLastMessages> = new Subject();
    this.httpService
      .get<IGetLastMessages>(url, this.storage.getToken('auth-token')!)
      .subscribe(({ lastMessages, messagesPerPage }) => {
        this.store.dispatch(
          addLastMessages({ chatId: this.currentChat.id!, lastMessages })
        );
        this.messagesPerPage == null &&
          this.store.dispatch(
            setMessagesPerPage({
              chatId: this.currentChat.id!,
              messagesPerPage,
            })
          );
        subject.next({ lastMessages, messagesPerPage });
      });

    return subject;
  }

  getOldestMessages(conversationId: string, lastMessageId?: string) {
    const url: string = lastMessageId
      ? `/conversations/${conversationId}/oldestMessages?lastMessageId=${lastMessageId}`
      : `/conversations/${conversationId}/oldestMessages`;

    const subject: Subject<IMessage[]> = new Subject();
    this.httpService
      .get<IMessage[]>(
        url,
        this.storage.getToken('auth-token')!
      )
      .subscribe((oldestMessages ) => {
        this.store.dispatch(
          addOldestMessages({
            chatId: this.currentChat.id!,
            messages: oldestMessages,
          })
        );
        subject.next(oldestMessages);
      });

    return subject;
  }
  setCurrentChat(chat: IConversation) {
    this.currentChat = chat;
  }

  setMessageError(value: string | null) {
    this.store.dispatch(
      setMessageError({ chatId: this.currentChat.id!, value })
    );
  }

  addNewMessage() {
    this.store.dispatch(addNewMessage({ chatId: this.currentChat.id! }));
  }
  getAllChats() {
    const getAllChatsSubscription = this.httpService
      .get<IConversation[]>(
        '/conversations',
        this.storage.getToken('auth-token')!
      )
      .subscribe({
        next: (chats) => {
          this.store.dispatch(setChats({ chats }));
        },
        error: (err: any) => {
          this.store.dispatch(setError({ error: err }));
          this.router.navigate(['/error']);
        },
      });
    this.subscriptions$.push(getAllChatsSubscription);
  }
  getChatById(chatId: string): Observable<IConversation> {
    return this.httpService.get<IConversation>(
      `/conversations/${chatId}`,
      this.storage.getToken('auth-token')!
    );
  }
  deleteChat(id: string) {
    const deleteChatSubscription = this.httpService
      .delete(`/conversations/${id}`, this.storage.getToken('auth-token')!)
      .subscribe({
        next: () => {
          this.store.dispatch(deleteChat({ id }));
        },
        error: (err: any) => {
          this.store.dispatch(setError({ error: err }));
          this.router.navigate(['/error']);
        },
      });
    this.subscriptions$.push(deleteChatSubscription);
  }
  deleteMessage(currentChatId: string, messageId: string) {
    const deleteMessageSubscription = this.httpService
      .delete(
        `/conversations/${currentChatId}/messages/${messageId}`,
        this.storage.getToken('auth-token')!
      )
      .subscribe({
        next: () => {
          this.store.dispatch(
            deleteMessage({ chatId: this.currentChat.id!, messageId })
          );
        },
        error: (err: any) => {
          this.store.dispatch(setError({ error: err }));
          this.router.navigate(['/error']);
        },
      });
    this.subscriptions$.push(deleteMessageSubscription);
  }
  addChat(chat: IConversation): Observable<IConversation> {
    return this.httpService.post<IConversation>(
      '/conversations',
      { chat },
      this.storage.getToken('auth-token')!
    );
  }
  listenForMessages(): void {
    this.socketService.on('message', (data: IFullMessageInfo) => {
      if (
        data.conversationId === this.currentChat?.id &&
        data.message.writer.username !== this.user.username
      ) {
        this.addMessage(data.message);
      } else if (data.message.writer.username !== this.user.username) {
        const selectChatByIdSubscription = this.store
          .select(selectChatById(data.conversationId))
          .pipe(take(1))
          .subscribe((chat) => {
            chat!.lastMessages.length > 0 &&
              this.addMessageToChatByChatId(data.conversationId, data.message);
          });
        this.subscriptions$.push(selectChatByIdSubscription);
      }
    });
  }

  addMessage(message: IMessage) {
    this.store.dispatch(addMessage({ chatId: this.currentChat.id!, message }));
  }

  addMessageToChatByChatId(chatId: string, message: IMessage) {
    this.store.dispatch(addMessageToChatByChatId({ chatId, message }));
  }

  createMessage(user: IUser, messageText: string): IMessage {
    const message: IMessage = this.chatFactory.createMessage(user, messageText);

    return message;
  }

  submitMessage(message: IMessage): void {
    this.sendMessagesCount += 1;

    if (this.sendMessagesCount % 2 === 0) {
      throw new Error("Your message doesn't send please try again!");
    }
    const messageInfo: IMessageInfo = {
      ...message,
      conversationId: this.currentChat!.id!,
    };

    this.socketService.emitMessage(messageInfo, (response: any) => {
      response.status === 'ok' &&
        this.replaceMessage(response.message, messageInfo.id);
    });
  }

  replaceMessage(message: IMessage, messageId: string) {
    this.store.dispatch(
      replaceMessageById({ chatId: this.currentChat.id!, messageId, message })
    );
  }

  addNewConversation(chat: IConversation): void {
    const addChatSubscription = this.addChat(chat)!.subscribe(
      (conversation) => {
        this.store.dispatch(setSelectedChatId({ chatId: chat.id! }));
        this.store.dispatch(addChat({ chat: conversation }));
      }
    );
    this.subscriptions$.push(addChatSubscription);
  }
}

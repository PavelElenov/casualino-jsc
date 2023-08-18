import { Injectable, OnDestroy } from '@angular/core';
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
  selectCurrentChat,
  selectMessages,
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
  clearSelectedChatId,
  setSelectedChatId,
  addMessageToChatByChatId,
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
  currentChat: IConversation | undefined;
  sendMessagesCount: number = 0;
  messagesPerPage: number | null = null;
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private socketService: SocketService,
    private store: Store<IState>,
    private chatFactory: ChatFactory,
    private router: Router
  ) {
    const userSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    const currentChatSubscription = this.store
      .select(selectCurrentChat)
      .subscribe((currentChat) => (this.currentChat = currentChat));

    const messagePerPageSubscription = this.store
      .select(selectMessagesPerPage)
      .subscribe((messagesPerPage) => {
        this.messagesPerPage = messagesPerPage;
      });

    this.subscriptions$.push(currentChatSubscription);
    this.subscriptions$.push(userSubscription);
    this.subscriptions$.push(messagePerPageSubscription);
  }
  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }

  setWaitingForLastMessages(value: boolean) {
    this.store.dispatch(setWaitingForMessages({ value }));
  }

  setLastPage() {
    this.store.dispatch(setLastPageEqualsToTrue());
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
    this.store.dispatch(clearNewMessages());
  }

  clearCurrentChat() {
    this.store.dispatch(clearSelectedChatId());
  }

  substractOneNewMessage() {
    this.store.dispatch(substractOneNewMessage());
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
        this.store.dispatch(addLastMessages({ lastMessages }));
        this.messagesPerPage == null &&
          this.store.dispatch(setMessagesPerPage({ messagesPerPage }));
        subject.next({ lastMessages, messagesPerPage });
      });

    return subject;
  }
  setCurrentChat(chat: IConversation) {
    this.store.dispatch(setSelectedChatId({ chatId: chat.id! }));
  }

  addNewMessage() {
    this.store.dispatch(addNewMessage());
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
          this.store.dispatch(deleteMessage({ messageId }));
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
    this.store.dispatch(addMessage({ message }));
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

    this.socketService.emitMessage(
      messageInfo,
      (response: any) =>
      {
        response.status === 'ok' &&
        this.replaceMessage(response.message, messageInfo.id)
      }
    );
  }

  replaceMessage(message: IMessage, messageId: string) {
    this.store.dispatch(replaceMessageById({ messageId, message }));
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

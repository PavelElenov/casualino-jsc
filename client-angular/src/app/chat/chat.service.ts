import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
import { HttpService } from '../shared/services/http/http.service';
import { StorageTokenService } from '../shared/services/storage/storage-token.service';
import {
  IConversation,
  IConversationWithoutId,
  IFullMessageInfo,
  IMessage,
  IMessageInfo,
} from '../shared/interfaces/message';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../shared/services/socket/socket.service';
import {
  selectCurrentChat,
  selectMessages,
  selectUser,
} from '../+store/selectors';
import { Store } from '@ngrx/store';
import { IState } from '../+store';
import {
  addChat,
  addMessage,
  addNewMessage,
  deleteChat,
  deleteMessage,
  likeChat,
  setChats,
  setCurrentChat,
  setError,
  setLastMessages,
} from '../+store/actions';
import { IUser } from '../shared/interfaces/user';
import { ChatFactory } from '../shared/factories/chatFactory';
import { MessageFactroy } from '../shared/factories/messageFactory';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  subscriptions$: Subscription[] = [];
  user!: IUser;
  messages!: IMessage[];
  currentChat: IConversation | undefined;
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private socketService: SocketService,
    private store: Store<IState>,
    private chatFactory: ChatFactory,
    private messageFactory: MessageFactroy,
    private router: Router
  ) {
    const userSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));
    const messagesSubscription = this.store
      .select(selectMessages)
      .subscribe((messages) => (this.messages = messages));
    const currentChatSubscription = this.store
      .select(selectCurrentChat)
      .subscribe((currentChat) => (this.currentChat = currentChat));

    this.subscriptions$.push(currentChatSubscription);
    this.subscriptions$.push(messagesSubscription);
    this.subscriptions$.push(userSubscription);
  }
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe());
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
  setCurrentChat(chat: IConversation) {
    this.store.dispatch(setCurrentChat({ currentChat: chat }));

    const getLastMessagesSubscription = this.httpService
      .get<IMessage[]>(`/conversations/${chat.id}/lastMessages`, this.storage.getToken("auth-token")!)
      .subscribe((lastMessages: IMessage[]) => {
        console.log(lastMessages);

        this.store.dispatch(setLastMessages({ lastMessages }));
      });

    this.subscriptions$.push(getLastMessagesSubscription);
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
  getChatById(chatId: number): Observable<IConversation> {
    return this.httpService.get<IConversation>(
      `/conversations/${chatId}`,
      this.storage.getToken('auth-token')!
    );
  }
  deleteChat(id: number) {
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
  deleteMessage(currentChatId: number, messageId: number) {
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
  addChat(chat: IConversationWithoutId): Observable<IConversation> {
    return this.httpService.post<IConversation>(
      '/conversations',
      { chat },
      this.storage.getToken('auth-token')!
    );
  }
  listenForMessages(): void {
    this.socketService.on('message', (data: IFullMessageInfo) => {
      const currentChatSubscription = this.store
        .select(selectCurrentChat)
        .subscribe(async (currentChat) => {
          if (data.conversationId === currentChat?.id) {
            this.store.dispatch(addMessage({ message: data.message }));

            if (data.writer.username !== this.user.username) {
              this.messages.length > 4 && this.store.dispatch(addNewMessage());
            }
          }
        });

      this.subscriptions$.push(currentChatSubscription);
    });
  }
  async submitMessage(message: string): Promise<void> {
    const messageInfo: IMessageInfo = this.chatFactory.createMessageInfoObject(
      this.user,
      message,
      this.currentChat!.id
    );

    this.socketService.emitMessage(messageInfo);
  }

  addNewConversation(chat: IConversationWithoutId): void {
    const addChatSubscription = this.addChat(chat)!.subscribe(
      (conversation) => {
        this.store.dispatch(setCurrentChat({ currentChat: conversation }));
        this.store.dispatch(addChat({ chat: conversation }));
      }
    );
    this.subscriptions$.push(addChatSubscription);
  }
}

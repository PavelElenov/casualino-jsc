import { Injectable, OnDestroy } from '@angular/core';
import { HttpService } from '../shared/services/http/http.service';
import { StorageTokenService } from '../shared/services/storage/storage-token.service';
import {
  IConversation,
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
  setCurrentChat,
} from '../+store/actions';
import { IUser } from '../shared/interfaces/user';
import { ChatFactory } from '../shared/factories/chatFactory';
import { MessageFactroy } from '../shared/factories/messageFactory';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  subscriptions$: Subscription[] = [];
  user!: IUser;
  messages!: IMessage[];
  currentChat!: IConversation;
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private socketService: SocketService,
    private store: Store<IState>,
    private chatFactory: ChatFactory,
    private messageFactory: MessageFactroy
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
  getAllChats(): Observable<IConversation[]> {
    return this.httpService.get<IConversation[]>(
      '/conversations',
      this.storage.getToken('auth-token')!
    );
  }
  getChatByName(chatName: string): Observable<IConversation> {
    return this.httpService.get<IConversation>(
      `/conversations/${chatName}`,
      this.storage.getToken('auth-token')!
    );
  }
  deleteChat(name: string): Observable<any> {
    return this.httpService.delete(
      `/conversations/${name}`,
      this.storage.getToken('auth-token')!
    );
  }
  deleteMessage(currentChatName: string, messageText: string): Observable<any> {
    return this.httpService.delete(
      `/conversations/${currentChatName}/messages/${messageText}`,
      this.storage.getToken('auth-token')!
    );
  }
  addChat(chat: IConversation): Observable<any> {
    return this.httpService.post(
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
          if (data.conversation == currentChat.name) {
            const message: IMessage = this.messageFactory.createMessage(
              data.writer,
              data.text,
              data.time
            );
            this.store.dispatch(addMessage({message}));

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
      this.currentChat!.name
    );

    if (this.currentChat.name == '') {
      const chat = this.chatFactory.createConversation({
        name: this.user.username,
        img: this.user.img,
        level: this.user.level,
      });
      this.addNewConversation(chat);
      messageInfo.conversation = chat.name;
    }

    this.socketService.emitMessage(messageInfo);
  }

  addNewConversation(chat: IConversation): void {
    const addChatSubscription = this.addChat(chat)!.subscribe(() => {
      this.store.dispatch(setCurrentChat({ currentChat: chat }));
      this.store.dispatch(addChat({ chat }));
    });
    this.subscriptions$.push(addChatSubscription);
  }
}

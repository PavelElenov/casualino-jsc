import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
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
  deleteChat,
  deleteMessage,
  likeChat,
  setChats,
  setCurrentChat,
  setError,
  setMessages,
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
    private router: Router,
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
  likeChat(conversation: IConversation){
    const chat = {...conversation, likes: conversation.likes + 1};
    const likeSubscription = this.httpService.post(`/conversations/${conversation.name}/like`, {}, this.storage.getToken("auth-token")!).subscribe(() => {
      this.store.dispatch(likeChat({chat}));
    });
    this.subscriptions$.push(likeSubscription);
  }
  createConversation(): IConversation {
    const conversation: IConversation = this.chatFactory.createConversation({
      name: '',
      img: '',
      level: 0,
    });
    this.store.dispatch(setCurrentChat({ currentChat: conversation }));
    return conversation;
  }
  setCurrentChat(chat: IConversation) {
    this.store.dispatch(setCurrentChat({ currentChat: chat }));
  
    if (chat.messages.length > 0) {
      this.store.dispatch(setMessages({ messages: chat.messages }));
    } else {
      this.store.dispatch(setMessages({ messages: [] }));
    }
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
  getChatByName(chatName: string): Observable<IConversation> {
    return this.httpService.get<IConversation>(
      `/conversations/${chatName}`,
      this.storage.getToken('auth-token')!
    );
  }
  deleteChat(name: string) {
    const deleteChatSubscription = this.httpService
      .delete(`/conversations/${name}`, this.storage.getToken('auth-token')!)
      .subscribe({
        next: () => {
          this.store.dispatch(deleteChat({ name }));
        },
        error: (err: any) => {
          this.store.dispatch(setError({ error: err }));
          this.router.navigate(['/error']);
        },
      });
    this.subscriptions$.push(deleteChatSubscription);
  }
  deleteMessage(currentChatName: string, messageText: string) {
    const deleteMessageSubscription = this.httpService
      .delete(
        `/conversations/${currentChatName}/messages/${messageText}`,
        this.storage.getToken('auth-token')!
      )
      .subscribe({
        next: () => {
          this.store.dispatch(deleteMessage({ messageText }));
        },
        error: (err: any) => {
          this.store.dispatch(setError({ error: err }));
          this.router.navigate(['/error']);
        },
      });
    this.subscriptions$.push(deleteMessageSubscription);
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
          if (data.conversation == currentChat?.name) {
            const message: IMessage = this.messageFactory.createMessage(
              data.writer,
              data.text,
              data.time
            );
            this.store.dispatch(addMessage({ message }));

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

    if (this.currentChat?.name == '') {
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

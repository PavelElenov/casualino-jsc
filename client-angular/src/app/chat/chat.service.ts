import { Injectable, OnDestroy } from '@angular/core';
import { HttpService } from '../shared/services/http/http.service';
import { StorageTokenService } from '../shared/services/storage/storage-token.service';
import {
  IConversation,
  IFullMessageInfo,
  IMessage,
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
import { addMessage, addNewMessage } from '../+store/actions';
import { IUser } from '../shared/interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  subscriptions$: Subscription[] = [];
  user!: IUser;
  messages!: IMessage[];
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private socketService: SocketService,
    private store: Store<IState>
  ) {
    const subscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));
    const subscription2 = this.store
      .select(selectMessages)
      .subscribe((messages) => (this.messages = messages));
    this.subscriptions$.push(subscription2);
    this.subscriptions$.push(subscription);
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
      const subscription = this.store
        .select(selectCurrentChat)
        .subscribe(async (currentChat) => {
          if (data.conversation == currentChat.name) {
            this.store.dispatch(
              addMessage({
                message: {
                  writer: data.writer,
                  text: data.text,
                  time: data.time,
                },
              })
            );

            if (data.writer.username !== this.user.username) {
              this.messages.length > 4 && this.store.dispatch(addNewMessage());
            }
          }
        });

      this.subscriptions$.push(subscription);
    });
  }
}

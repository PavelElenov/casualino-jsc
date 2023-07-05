import { Injectable, OnDestroy } from '@angular/core';
import { HttpService } from '../core/login/services/http/http.service';
import { StorageTokenService } from '../core/login/services/storage/storage-token.service';
import { IConversation, IFullMessageInfo } from '../shared/interfaces/message';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../core/login/services/socket/socket.service';
import { selectCurrentChat } from '../+store/selectors';
import { Store } from '@ngrx/store';
import { IState } from '../+store';
import { addMessage } from '../+store/actions';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy{
  subscriptions$: Subscription[] = []
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private socketService: SocketService,
    private store: Store<IState>
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.map(s => s.unsubscribe());
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
    this.socketService.socket?.on('message', (data: IFullMessageInfo) => {
      const subscription = this.store
        .select(selectCurrentChat)
        .subscribe(async (currentChat) => {
          if (data.conversation == currentChat.name) {
            await this.store.dispatch(
              addMessage({
                message: {
                  writer: data.writer,
                  text: data.text,
                  time: data.time,
                },
              })
            );
            this.goToTheBottomOfTheMessages();
          }
          
        });

      this.subscriptions$.push(subscription);
    });
  }

  goToTheBottomOfTheMessages(): void {
    const messagesDiv: HTMLDivElement = document.getElementById(
      "messages"
    ) as HTMLDivElement;

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

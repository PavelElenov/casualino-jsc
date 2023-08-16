import { Injectable, OnDestroy } from '@angular/core';
import { HttpService } from '../shared/services/http/http.service';
import { StorageTokenService } from '../shared/services/storage/storage-token.service';
import {
  IConversation,
  IFullMessageInfo,
  IMessage,
  IMessageInfo,
} from '../shared/interfaces/message';
import { Observable, Subject, Subscription,} from 'rxjs';
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
  clearCurrentChat,
  clearNewMessages,
  deleteChat,
  deleteMessage,
  likeChat,
  setChats,
  setCurrentChat,
  setError,
  substractOneNewMessage,
  replaceMessageById,
  setMessagesPerPage,
  addLastMessages
} from '../+store/actions';
import { IUser } from '../shared/interfaces/user';
import { ChatFactory } from '../shared/factories/chatFactory';
import { Router } from '@angular/router';

interface IGetLastMessages{
  lastMessages: IMessage[],
  messagesPerPage?: number
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
    this.subscriptions$.forEach((s) => s.unsubscribe());
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

  clearNewMessages(){
    this.store.dispatch(clearNewMessages());
  }

  clearCurrentChat(){
    this.store.dispatch(clearCurrentChat())
  }

  substractOneNewMessage(){
    this.store.dispatch(substractOneNewMessage());
  }

  getLastMessages(
    conversationId: string,
    lastMessageId?: string
  ): Observable<IGetLastMessages> {
    
    
    const url = lastMessageId
      ? `/conversations/${conversationId}/lastMessages?lastMessageId=${lastMessageId}`
      : `/conversations/${conversationId}/lastMessages`;

    const subject:Subject<IGetLastMessages> = new Subject();
    const data$ =  this.httpService
      .get<IGetLastMessages>(url, this.storage.getToken('auth-token')!);
    data$.subscribe(({lastMessages, messagesPerPage}) => {  
      console.log("hi");
      this.store.dispatch(addLastMessages({ lastMessages }));
      messagesPerPage && this.store.dispatch(setMessagesPerPage({messagesPerPage}));
      subject.next({lastMessages, messagesPerPage})
    });
    

    return subject;     
  }
  setCurrentChat(chat: IConversation) {
    this.store.dispatch(setCurrentChat({ currentChat: chat }));
  }

  addNewMessage(){
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
      if (data.conversationId === this.currentChat?.id && data.message.writer.username !== this.user.username) {
        this.addMessage(data.message);
      }      
    });
  }

  addMessage(message: IMessage){
    this.store.dispatch(addMessage({message}));
  }

  createMessage(user: IUser, messageText: string): IMessage{
    const message:IMessage = this.chatFactory.createMessage(
      user,
      messageText
    );

    return message
  }

  submitMessage(message: IMessage): void{
    this.sendMessagesCount += 1;

    if (this.sendMessagesCount % 2 === 0) {
      throw new Error("Your message doesn't send please try again!");
    }
    const messageInfo: IMessageInfo = {...message, conversationId: this.currentChat!.id!};

    this.socketService.emitMessage(messageInfo, (response: any) => this.replaceMessage(response.message, messageInfo.id));
  }

  replaceMessage(message: IMessage, messageId: string){
    this.store.dispatch(replaceMessageById({messageId, message}));
  }

  addNewConversation(chat: IConversation): void {
    const addChatSubscription = this.addChat(chat)!.subscribe(
      (conversation) => {
        this.store.dispatch(setCurrentChat({ currentChat: conversation }));
        this.store.dispatch(addChat({ chat: conversation }));
      }
    );
    this.subscriptions$.push(addChatSubscription);
  }
}

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
  selectMessagesByIds,
  selectUser,
} from '../+store/selectors';
import { Store } from '@ngrx/store';
import { IState } from '../+store';
import {
  addChat,
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
  setMessageSendingStatus,
} from '../+store/actions';
import { IUser } from '../shared/interfaces/user';
import { ChatFactory } from '../shared/factories/chatFactory';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { SelectorClass } from './selectorClass';
import { ClientRequests } from './clientRequests';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  subscriptions$: Subscription[] = [];
  user!: IUser;
  messages!: IMessage[];
  sendMessagesCount: number = 0;
  messagesPerPage: number | null = null;
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private socketService: SocketService,
    private store: Store<IState>,
    private chatFactory: ChatFactory,
    private router: Router,
    private selector: SelectorClass,
    private clientRequests: ClientRequests
  ) {
    const userSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    this.subscriptions$.push(userSubscription);
  }
  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }

  returnLastMessages(
    allMessages: IMessage[],
    lastMessagesIdsRead: string[]
  ): IMessage[] {
    const lastMessages: IMessage[] = lastMessagesIdsRead.map((messageId) => {
      const message: IMessage = allMessages.find((m) => m.id === messageId)!;
      return message;
    });

    return lastMessages;
  }

  returnOldestMessages(
    allMessages: IMessage[],
    oldestMessagesIdsRead: string[]
  ): IMessage[] {
    const oldestMessages: IMessage[] = oldestMessagesIdsRead.map(
      (messageId) => {
        const message: IMessage = allMessages.find((m) => m.id === messageId)!;
        return message;
      }
    );
    return oldestMessages;
  }

  setWaitingForLastMessages(chatId: string, value: boolean) {
    this.store.dispatch(setWaitingForMessages({ chatId, value }));
  }

  setLastPage(chatId: string) {
    this.store.dispatch(setLastPageEqualsToTrue({ chatId }));
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

  clearNewMessages(chatId: string) {
    this.store.dispatch(clearNewMessages({ chatId }));
  }

  clearCurrentChat(chatId: string) {
    this.store.dispatch(clearChat({ chatId }));
  }

  substractOneNewMessage(chatId: string) {
    this.store.dispatch(substractOneNewMessage({ chatId }));
  }

  getLastMessages(
    conversationId: string,
    lastMessageId?: string
  ): Observable<IMessage[]> {
    const url = lastMessageId
      ? `/conversations/${conversationId}/lastMessages?lastMessageId=${lastMessageId}`
      : `/conversations/${conversationId}/lastMessages`;

    const subject: Subject<IMessage[]> = new Subject();
    this.setWaitingForLastMessages(conversationId, true);

    this.clientRequests
      .getMessages<{ lastMessages: IMessage[]; messagesPerPage: number }>(url)
      .subscribe(({ lastMessages, messagesPerPage }) => {
        this.setWaitingForLastMessages(conversationId, false);

        if (lastMessages.length > 0) {
          this.messagesPerPage == null &&
            this.store.dispatch(
              setMessagesPerPage({
                chatId: conversationId,
                messagesPerPage,
              })
            );

          if (lastMessages.length < messagesPerPage) {
            this.setLastPage(conversationId);
          }
          const chat = this.selector.select(selectCurrentChat(conversationId));

          if (
            this.checkForOldestAndLastMessagesOverlapping(
              chat.oldestMessagesIdsRead,
              lastMessages[0].id
            )
          ) {
            this.setLastPage(conversationId);
            const messagesToAdd: IMessage[] = this.getMessagesToAdd(
              chat.oldestMessagesIdsRead,
              lastMessages
            );
            this.concatOldestAndLastMessages(
              messagesToAdd,
              chat.oldestMessagesIdsRead,
              chat.lastMessagesIdsRead,
              {
                conversationId,
                lastMessageOfLastMessagesId: lastMessageId!,
              }
            );
            subject.next(lastMessages);
          } else {
            this.store.dispatch(
              addLastMessages({
                chatId: conversationId,
                lastMessages,
                lastMessageId,
              })
            );
            subject.next(lastMessages);
          }
        }
      });

    return subject;
  }

  getOldestMessages(
    conversationId: string,
    lastMessageOfLastMessagesId: string,
    lastMessageId?: string
  ): Observable<IMessage[]> {
    const url: string = lastMessageId
      ? `/conversations/${conversationId}/oldestMessages?lastMessageId=${lastMessageId}`
      : `/conversations/${conversationId}/oldestMessages`;

    const subject: Subject<IMessage[]> = new Subject();
    this.setWaitingForLastMessages(conversationId, true);
    this.clientRequests
      .getMessages<IMessage[]>(url)
      .subscribe((oldestMessages) => {
        this.setWaitingForLastMessages(conversationId, false);

        if (oldestMessages.length > 0) {
          const chat = this.selector.select(selectCurrentChat(conversationId));

          if (
            this.checkForOldestAndLastMessagesOverlapping(
              chat.lastMessagesIdsRead,
              oldestMessages[oldestMessages.length - 1].id
            )
          ) {
            this.setLastPage(conversationId);
            const messagesToAdd: IMessage[] = this.getMessagesToAdd(
              chat.lastMessagesIdsRead,
              oldestMessages
            );
            this.concatOldestAndLastMessages(
              messagesToAdd,
              chat.oldestMessagesIdsRead,
              chat.lastMessagesIdsRead,
              { conversationId, lastMessageOfLastMessagesId }
            );
            subject.next(oldestMessages);
          } else {
            this.store.dispatch(
              addOldestMessages({
                chatId: conversationId,
                lastMessageId: lastMessageOfLastMessagesId,
                messages: oldestMessages,
              })
            );
            subject.next(oldestMessages);
          }
        }
      });

    return subject;
  }

  getMessagesToAdd(MessagesIds: string[], newMessages: IMessage[]): IMessage[] {
    const messagesToAdd: IMessage[] = newMessages.filter(
      (m) => !MessagesIds.find((id) => id === m.id)
    );

    return messagesToAdd;
  }

  concatOldestAndLastMessages(
    messagesToAdd: IMessage[],
    oldestMessagesIds: string[],
    lastMessagesIds: string[],
    data: { conversationId: string; lastMessageOfLastMessagesId: string }
  ) {
    this.store.dispatch(
      addOldestMessages({
        chatId: data.conversationId,
        lastMessageId: data.lastMessageOfLastMessagesId,
        messages: [...messagesToAdd, ...this.getMessagesByIds(lastMessagesIds)],
      })
    );
    this.store.dispatch(
      addLastMessages({
        chatId: data.conversationId,
        lastMessages: [
          ...this.getMessagesByIds(oldestMessagesIds),
          ...messagesToAdd,
        ],
      })
    );
  }

  getMessagesByIds(messagesIds: string[]): IMessage[] {
    let messagesForReturn: IMessage[] = [];
    const selectMessagesByIdsSubscription = this.store
      .select(selectMessagesByIds(messagesIds))
      .pipe(take(1))
      .subscribe((messages) => {
        messagesForReturn = messages;
      });

    return messagesForReturn;
  }

  setMessageError(chatId: string, value: string | null) {
    this.store.dispatch(setMessageError({ chatId, value }));
  }

  addNewMessage(chatId: string) {
    this.store.dispatch(addNewMessage({ chatId }));
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
            deleteMessage({ chatId: currentChatId, messageId })
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
      if (data.message.writer.username !== this.user.username) {
        this.addMessageToChatByChatId(data.conversationId, data.message);
      } else if (data.message.writer.username !== this.user.username) {
        const selectChatByIdSubscription = this.store
          .select(selectChatById(data.conversationId))
          .pipe(take(1))
          .subscribe((chat) => {
            chat!.lastMessagesIdsRead.length > 0 &&
              this.addMessageToChatByChatId(data.conversationId, data.message);
          });
        this.subscriptions$.push(selectChatByIdSubscription);
      }
    });
  }

  addMessage(chatId: string, message: IMessage) {
    this.store.dispatch(addMessageToChatByChatId({ chatId, message }));
  }

  addMessageToChatByChatId(chatId: string, message: IMessage) {
    this.store.dispatch(addMessageToChatByChatId({ chatId, message }));
  }

  createMessage(user: IUser, messageText: string, chatId: string): IMessage {
    const message: IMessage = this.chatFactory.createMessage(
      user,
      messageText,
      chatId
    );

    return message;
  }

  checkForOldestAndLastMessagesOverlapping(
    MessagesIds: string[],
    lastMessageId: string
  ): boolean {
    if (MessagesIds.find((id) => id === lastMessageId)) {
      return true;
    }
    return false;
  }

  submitMessage(chatId: string, message: IMessage): void {
    const messageInfo: IMessageInfo = {
      ...message,
      conversationId: chatId,
    };

    this.store.dispatch(
      setMessageSendingStatus({
        chatId,
        messageId: message.id,
        status: true,
      })
    );

    this.socketService.emitMessage(messageInfo, async (response: any) => {
      if (response.status === 'ok') {
        await this.replaceMessage(chatId, response.message, messageInfo.id);
        this.store.dispatch(
          setMessageSendingStatus({
            chatId,
            messageId: response.message.id,
            status: false,
          })
        );
      } else {
        this.store.dispatch(
          setMessageError({
            chatId,
            value: response.status,
          })
        );
      }
    });
  }

  replaceMessage(chatId: string, message: IMessage, messageId: string) {
    this.store.dispatch(replaceMessageById({ chatId, messageId, message }));
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

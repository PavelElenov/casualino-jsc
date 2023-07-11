import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Observable, Subscription } from 'rxjs';
import { IConversation } from 'src/app/shared/interfaces/message';

import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { IState } from 'src/app/+store';
import { Store } from '@ngrx/store';
import {
  addChat,
  setChats,
  setCurrentChat,
  setError,
  setMessages,
  setUser,
} from 'src/app/+store/actions';
import { selectChats } from 'src/app/+store/selectors';
import { StorageTokenService } from 'src/app/shared/services/storage/storage-token.service';
import { Router } from '@angular/router';
import { ChatFactory } from 'src/app/shared/factories/chatFactory';

@Component({
  selector: 'app-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
})
export class ChatsListComponent implements OnInit, OnDestroy {
  chats$: Observable<IConversation[]> | undefined;
  currentChat: IConversation | undefined;
  subscriptions$: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private store: Store<IState>,
    private userService: UserService,
    private storage: StorageTokenService,
    private timeService: TimeService,
    private router: Router,
    private chatFactory: ChatFactory
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe());
  }

  ngOnInit() {
    this.timeService.getServerTime();
    const authToken = this.storage.getToken('auth-token');

    if (authToken) {
      const userSubscription = this.userService
        .getUserByToken(authToken)!
        .subscribe((user) => this.store.dispatch(setUser({ user })));
      this.subscriptions$.push(userSubscription);
    }
    const getAllChatsSubscription = this.chatService.getAllChats().subscribe({
      next: (chats) => {
        this.store.dispatch(setChats({ chats }));
        this.chats$ = this.store.select(selectChats);
      },
      error: (err: any) => {
        this.store.dispatch(setError({ error: err }));
        this.router.navigate(['/error']);
      },
    });

    this.subscriptions$.push(getAllChatsSubscription);
    this.socketService.connectToServer();
    this.chatService.listenForMessages();
  }

  getCurrentChat(chat: Observable<IConversation>) {
    const subscription$ = chat.subscribe((chat) => {
      this.currentChat = chat;
      this.store.dispatch(setCurrentChat({ currentChat: chat }));

      if (this.currentChat!.messages.length > 0) {
        this.store.dispatch(
          setMessages({ messages: this.currentChat!.messages })
        );
      } else {
        this.store.dispatch(setMessages({ messages: [] }));
      }
    });

    this.subscriptions$.push(subscription$);
  }
  createNewConversation(): void {
    const conversation: IConversation = this.chatFactory.createConversation({
      name: '',
      img: '',
      level: 0,
    });
    this.store.dispatch(addChat({ chat: conversation }));
    this.store.dispatch(setCurrentChat({ currentChat: conversation }));
    this.currentChat = conversation;
  }

  closeCurrentChat(): void {
    this.currentChat = undefined;
    this.store.dispatch(setCurrentChat({ currentChat: undefined }));
  }

  showPopup() {
    const popup:HTMLDialogElement = document.getElementById("popup")! as HTMLDialogElement;
    popup.showModal();
    popup.setAttribute("open", "");
    console.log(popup);
  }

  closePopup(){
    const popup:HTMLDialogElement = document.getElementById("popup")! as HTMLDialogElement;
    popup.removeAttribute("open");
    popup.setAttribute("close", "");

    popup.addEventListener("animationend", () => {
      popup.removeAttribute("close");
      popup.close();
    }, {once: true})
  }

  logoutUser(){
    this.userService.logout();
  }
}

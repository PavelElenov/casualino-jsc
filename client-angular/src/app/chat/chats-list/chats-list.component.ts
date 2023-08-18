import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ChatService } from '../chat.service';
import { Observable, Subscription } from 'rxjs';
import {
  IConversation,
} from 'src/app/shared/interfaces/message';
import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { IState } from 'src/app/+store';
import { Store } from '@ngrx/store';
import { clearMessages } from 'src/app/+store/actions';
import { selectChats, selectUser } from 'src/app/+store/selectors';
import { PopupService } from 'src/app/shared/services/popup/popup.service';
import { IUser } from 'src/app/shared/interfaces/user';

@Component({
  selector: 'app-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsListComponent implements OnInit, OnDestroy {
  @ViewChild('chatListPage', { read: ViewContainerRef })
  chats: IConversation[] | undefined;
  currentChat: IConversation | undefined;
  subscriptions$: Subscription[] = [];
  user!: IUser;
  chatListRef!: ViewContainerRef;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private store: Store<IState>,
    private userService: UserService,
    private timeService: TimeService,
    private popupService: PopupService,
    private changeDetection: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }

  ngOnInit() {
    this.timeService.getServerTime();
    
    const chatsSubscription = this.store.select(selectChats).subscribe((chats) => {
      this.chats = chats;
      this.changeDetection.detectChanges();
    });
    this.subscriptions$.push(chatsSubscription);

    this.chatService.getAllChats();

    this.userService.checkForUserAuthentication();

    const userSubscription = this.store
      .select(selectUser)
      .subscribe((user: IUser) => {
        this.user = user;
      });

    this.subscriptions$.push(userSubscription);

    this.socketService.connectToServer();
    this.chatService.listenForMessages();
  }

  trackByConversation(index: number, item: IConversation): string {
    return item.id!;
  }

  getCurrentChat(chat: Observable<IConversation>) {
    const getCurrentChatSubscription = chat.subscribe((chat) => {
      this.currentChat = chat;
      this.chatService.setCurrentChat(chat);
      this.changeDetection.detectChanges();
    });

    this.subscriptions$.push(getCurrentChatSubscription);
  }
  createNewConversation(): void {
    const newConversation: IConversation = {
      name: this.user.username,
      img: this.user.img,
      level: this.user.level,
      lastMessage: undefined,
      likes: 0,
    };
    this.chatService.addNewConversation(newConversation);
  }

  closeCurrentChat(): void {
    this.currentChat = undefined;
    this.store.dispatch(clearMessages());
  }

  showPopup() {
    this.popupService.showPopup(
      {
        text: 'Are you sure you want to logout',
        buttons: [
          {
            text: 'Logout',
            onClickFunc: () => this.userService.logout(),
          },
          {
            text: 'Close',
            onClickFunc: () => this.popupService.closePopup(),
          },
        ],
      },
      this.chatListRef
    );
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { IState } from 'src/app/+store';
import { ICurrentChatInfo } from 'src/app/+store/reducers';
import { selectCurrentChat, selectUser } from 'src/app/+store/selectors';
import { IConversation, IMessage } from 'src/app/shared/interfaces/message';
import { IUser } from 'src/app/shared/interfaces/user';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent implements OnDestroy {
  @Input() message!: IMessage;
  @Input() currentChatId!: string;
  time!: string;
  user!: IUser;
  subscriptions$: Subscription[] = [];
  
  constructor(
    private timeService: TimeService,
    private store: Store<IState>,
    private chatService: ChatService,
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.forEach((s) => s.unsubscribe());
  }
  ngOnInit() {
    this.time = this.timeService.getHowLongAgoMessageWasWritten(
      this.message.time,
      this.timeService.getCurrentTimeInMinutes()
    );
    const selectUserSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));

    this.subscriptions$.push(selectUserSubscription);
  }
  deleteMessage(messageId: string) {
    this.chatService.deleteMessage(this.currentChatId, messageId);
  }
}

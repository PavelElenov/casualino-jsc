import { Component, Input, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { IState } from "src/app/+store";
import { deleteMessage, setError } from "src/app/+store/actions";
import { selectCurrentChat, selectUser } from "src/app/+store/selectors";
import { IConversation, IMessage } from "src/app/shared/interfaces/message";
import { IUser } from "src/app/shared/interfaces/user";
import { TimeService } from "src/app/shared/services/time/time.service";
import { ChatService } from "../chat.service";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.scss"],
})
export class MessageComponent implements OnDestroy {
  @Input() message!: IMessage;
  time!: string;
  user!: IUser;
  subscriptions$: Subscription[] = [];
  currentChat!: IConversation;
  constructor(
    private timeService: TimeService,
    private store: Store<IState>,
    private chatService: ChatService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe());
  }
  ngOnInit() {
    this.time = this.timeService.getHowLongAgoMessageWasWritten(
      this.message.time,
      this.timeService.getCurrentTimeInMinutes()
    );
    const subscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));
    const subscription2 = this.store
      .select(selectCurrentChat)
      .subscribe((currentChat) => (this.currentChat = currentChat));

    this.subscriptions$.push(subscription2);
    this.subscriptions$.push(subscription);
  }
  deleteMessage(messageText: string) {
    console.log("hi");
    
    const subscription = this.chatService
      .deleteMessage(this.currentChat.name, messageText)
      .subscribe({
        next: () => {
          this.store.dispatch(deleteMessage({ messageText }));
        },
        error: (err: any) => {
          this.store.dispatch(setError({ error: err }));
          this.router.navigate(["/error"]);
        },
      });

    this.subscriptions$.push(subscription);
  }
}

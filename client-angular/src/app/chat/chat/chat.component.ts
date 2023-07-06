import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { IConversation } from "src/app/shared/interfaces/message";
import { TimeService } from "src/app/shared/services/time/time.service";
import { ChatService } from "../chat.service";
import { Observable, Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import { IState } from "src/app/+store";
import { deleteChat, setError } from "src/app/+store/actions";
import { Router } from "@angular/router";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnDestroy {
  @Input() chat!: IConversation;
  @Output() currentChatEvent = new EventEmitter<Observable<IConversation>>();
  time: string | undefined;
  subscriptions$: Subscription[] = [];

  constructor(
    private timeService: TimeService,
    private chatService: ChatService,
    private store: Store<IState>,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe());
  }
  ngOnInit() {
    if (this.chat.messages.length > 0) {
      const lastMessageTime: number =
        this.chat.messages[this.chat.messages.length - 1].time;
      this.time = this.timeService.getHowLongAgoMessageWasWritten(
        lastMessageTime,
        this.timeService.getCurrentTimeInMinutes()
      );
    }
  }
  getCurrentChat(chatName: string) {
    this.currentChatEvent.emit(this.chatService.getChatByName(chatName));
  }

  deleteChat(name: string) {
    const subsctiption = this.chatService.deleteChat(name).subscribe({
      next: () => {
        this.store.dispatch(deleteChat({ name }));
      },
      error: (err: any) => {
        this.store.dispatch(setError({ error: err }));
        this.router.navigate(["/error"]);
      },
    });
    this.subscriptions$.push(subsctiption);
  }
}

import { Component, Input, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { IState } from "src/app/+store";
import { selectUser } from "src/app/+store/selectors";
import { IMessage } from "src/app/shared/interfaces/message";
import { IUser } from "src/app/shared/interfaces/user";
import { TimeService } from "src/app/shared/services/time/time.service";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.scss"],
})
export class MessageComponent implements OnDestroy{
  @Input() message!: IMessage;
  time!: string;
  user!:IUser;

  subscriptions$: Subscription[] = [];

  constructor(private timeService: TimeService, private store: Store<IState>){}
  ngOnDestroy(): void {
    throw new Error("Method not implemented.");
  }

  ngOnInit(){
    this.time = this.timeService.getHowLongAgoMessageWasWritten(this.message.time, this.timeService.getCurrentTimeInMinutes());
    const subscription = this.store.select(selectUser).subscribe(user => this.user = user);

    this.subscriptions$.push(subscription);
  }
}

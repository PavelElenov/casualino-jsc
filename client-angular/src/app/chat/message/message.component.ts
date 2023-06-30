import { Component, Input } from '@angular/core';
import { IMessage } from 'src/app/shared/interfaces/message';
import { IUser } from 'src/app/shared/interfaces/user';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { UserService } from 'src/app/shared/services/user/user.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  @Input() message!: IMessage;
  time!: string;
  user!:IUser;

  constructor(private timeService: TimeService, private userService: UserService){}

  ngOnInit(){
    this.time = this.timeService.getHowLongAgoMessageWasWritten(this.message.time, this.timeService.getCurrentTimeInMinutes());
    this.user = this.userService.user!;

    console.log(this.message, this.user);
    
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { IConversation } from 'src/app/shared/interfaces/message';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { ChatService } from '../chat.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnDestroy {
  @Input() chat!: IConversation;
  @Output() currentChatEvent = new EventEmitter<Observable<IConversation>>();
  time: string | undefined;
  subscriptions$: Subscription[] = [];
  items: string[] = ["one", "two", "three"];

  constructor(
    private timeService: TimeService,
    private chatService: ChatService,
    private changeDetection: ChangeDetectorRef
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

  removeLastItem(){
    this.items.pop();
    this.changeDetection.detectChanges();
  }

  addItem(){
    this.items.push("four");
    this.changeDetection.detectChanges();
  }
  changeSelectedElementHandler(value: string){
    if(value == "Like"){
      this.chatService.likeChat(this.chat);
    }else{
      console.log(`You report chat with name ${this.chat.name}`);
    }
  }
  
  getCurrentChat(chatName: string) {
    this.currentChatEvent.emit(this.chatService.getChatByName(chatName));
  }

  deleteChat(name: string) {
    this.chatService.deleteChat(name);
  }  
}

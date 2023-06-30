import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IConversation } from 'src/app/shared/interfaces/message';
import { TimeService } from 'src/app/shared/services/time/time.service';
import { ChatService } from '../chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  @Input() chat!:IConversation;
  @Output() currentChatEvent = new EventEmitter<Observable<IConversation>>();
  time: string | undefined;

  constructor(private timeService: TimeService, private chatService: ChatService){}

  ngOnInit(){
    if(this.chat.messages.length > 0){
      const lastMessageTime: number = this.chat.messages[this.chat.messages.length - 1].time;
      this.time = this.timeService.getHowLongAgoMessageWasWritten(lastMessageTime, this.timeService.getCurrentTimeInMinutes());
      console.log(this.time);
      
    }
  }

  getCurrentChat(chatName: string){
    this.currentChatEvent.emit(this.chatService.getChatByName(chatName))
  }
}

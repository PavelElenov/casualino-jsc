import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { Observable } from 'rxjs';
import { IConversation } from 'src/app/shared/interfaces/message';

@Component({
  selector: 'app-chats-list',
  templateUrl: './chats-list.component.html',
  styleUrls: ['./chats-list.component.scss']
})
export class ChatsListComponent {
  chats$: Observable<IConversation[]> | undefined;
  currentChat$: Observable<IConversation> | undefined;

  constructor(private chatService: ChatService){}

  ngOnInit(){
    this.chats$ = this.chatService.getAllChats();
  }

  changeCurrentChat(chat: Observable<IConversation>){
    this.currentChat$ = chat;
  }
}

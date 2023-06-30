import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatsListComponent } from './chats-list/chats-list.component';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';



@NgModule({
  declarations: [
    ChatsListComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[ChatsListComponent]
})
export class ChatModule { }

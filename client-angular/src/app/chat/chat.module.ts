import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatsListComponent } from './chats-list/chats-list.component';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from './message/message.component';

@NgModule({
  declarations: [
    ChatsListComponent,
    ChatComponent,
    MessageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports:[ChatsListComponent]
})
export class ChatModule { }

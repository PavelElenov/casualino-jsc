import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatsListComponent } from './chats-list/chats-list.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ChatsListComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[ChatsListComponent]
})
export class ChatModule { }

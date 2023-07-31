import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatsListComponent } from "./chats-list/chats-list.component";
import { RouterModule } from "@angular/router";
import { ChatComponent } from "./chat/chat.component";
import { FormsModule } from "@angular/forms";
import { MessageComponent } from "./message/message.component";
import { CurrentChatComponent } from "./current-chat/current-chat.component";
import { SharedModule } from "../shared/shared.module";
import { ChatService } from "./chat.service";
import { ShareDataDirective } from "./directives/share-user-data-directive.directive";


@NgModule({
  declarations: [
    ChatsListComponent,
    ChatComponent,
    MessageComponent,
    CurrentChatComponent,
    ShareDataDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedModule,
  ],
  providers: [ChatService]

})
export class ChatModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpService } from './services/http/http.service';
import { UserService } from './services/user/user.service';
import { SocketService } from './services/socket/socket.service';
import { StorageTokenService } from './services/storage/storage-token.service';
import { AuthGuard } from './guards/auth-guard.guard';
import { ChatModule } from '../chat/chat.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    ChatModule
  ],
  providers: [UserService, HttpService, SocketService, StorageTokenService, AuthGuard]
})
export class SharedModule { }

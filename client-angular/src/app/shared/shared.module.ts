import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpService } from './services/http/http.service';
import { SocketService } from './services/socket/socket.service';
import { StorageTokenService } from './services/storage/storage-token.service';
import { AuthGuard } from './guards/auth-guard.guard';
import { RouterModule } from '@angular/router';
import { TimeService } from './services/time/time.service';
import { ErrorService } from './services/error/error.service';
import { ChatFactory } from './factories/chatFactory';
import { MessageFactroy } from './factories/messageFactory';
import { UserService } from './services/user/user.service';
import { PopupComponent } from './popup/popup.component';
import { PopupService } from './services/popup/popup.service';


@NgModule({
  declarations: [
    PopupComponent
  ],
  imports: [CommonModule, HttpClientModule, RouterModule],
  providers: [
    UserService,
    HttpService,
    SocketService,
    StorageTokenService,
    AuthGuard,
    TimeService,
    ErrorService,
    ChatFactory,
    MessageFactroy,
    PopupService
  ],
  exports: [PopupComponent]
})
export class SharedModule {}

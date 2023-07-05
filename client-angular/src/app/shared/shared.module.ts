import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpService } from "../core/login/services/http/http.service";
import { UserService } from "../core/login/services/user/user.service";
import { SocketService } from "../core/login/services/socket/socket.service";
import { StorageTokenService } from "../core/login/services/storage/storage-token.service";
import { AuthGuard } from "./guards/auth-guard.guard";
import { ChatModule } from "../chat/chat.module";
import { RouterModule } from "@angular/router";
import { TimeService } from "../core/login/services/time/time.service";
import { ErrorService } from "../core/login/services/error/error.service";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [UserService, HttpService, SocketService, StorageTokenService, AuthGuard, TimeService, ErrorService]
})
export class SharedModule { }

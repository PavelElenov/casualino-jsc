import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { HttpService } from './http.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from './socket.service';
import { StorageTokenService } from './storage-token.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [UserService, HttpService, SocketService, StorageTokenService]
})
export class SharedModule { }

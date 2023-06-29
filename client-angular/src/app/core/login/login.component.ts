import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IUserData } from 'src/app/shared/interfaces/user';
import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { StorageTokenService } from 'src/app/shared/services/storage/storage-token.service';
import { UserService } from 'src/app/shared/services/user/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  error:string | undefined;

  constructor(private userService: UserService, private storage: StorageTokenService, private router: Router, private socketService: SocketService) { }

  loginUser(form: NgForm) {
    if (form.valid) {
      this.userService.login(form.value).subscribe({
        next: (data: IUserData) => {
          this.userService.user = data.user;
          this.storage.storeToken('auth-token', data.token);
          this.socketService.connectToServer();
          this.router.navigate(['/chats']);
        },
        error: (error) => {
          if(error.status == 400){
            this.error = error.error;
          }
        }
      })
    };
  }

  changeHandler(): void{
    if(this.error){
      this.error = undefined;
    }
  }
}

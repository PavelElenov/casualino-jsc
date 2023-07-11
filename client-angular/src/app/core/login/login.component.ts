import { Component, OnDestroy } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { IState } from "src/app/+store";
import { setUser } from "src/app/+store/actions";
import { IUserData } from "src/app/shared/interfaces/user";
import { StorageTokenService } from "src/app/shared/services/storage/storage-token.service";
import {UserService} from "src/app/shared/services/user/user.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnDestroy{
  error: string | undefined;
  subscriptions$: Subscription[] = [];

  constructor(
    private userService: UserService,
    private storage: StorageTokenService,
    private router: Router,
    private store: Store<IState>
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.map(s => s.unsubscribe());
  }

  loginUser(form: NgForm) {
    if (form.valid) {
      const subscription = this.userService.login(form.value).subscribe({
        next: (data: IUserData) => {
          this.store.dispatch(setUser({user: data.user}))
          this.storage.storeToken("auth-token", data.token);
          this.router.navigate(["/chats"]);
        },
        error: (error) => {
          this.error = "Incorrect password or email!";
        },
      });

      this.subscriptions$.push(subscription);
    }
  }

  changeHandler(): void {
    if (this.error) {
      this.error = undefined;
    }
  }
}

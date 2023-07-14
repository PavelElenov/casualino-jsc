import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { IState } from 'src/app/+store';
import { setUser } from 'src/app/+store/actions';
import { selectError } from 'src/app/+store/selectors';
import { IUserData } from 'src/app/shared/interfaces/user';
import { StorageTokenService } from 'src/app/shared/services/storage/storage-token.service';
import { UserService } from 'src/app/shared/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy, OnInit {
  error!: string | undefined;
  subscriptions$: Subscription[] = [];

  constructor(private userService: UserService, private store: Store<IState>, private changeDetection: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.store.select(selectError).subscribe((error) => {
      this.error = error;
    });
  }
  ngOnDestroy(): void {
    this.subscriptions$.map((s) => s.unsubscribe());
  }

  loginUser(form: NgForm) {
    if (form.valid) {
      this.userService.login(form.value);
    }
  }

  changeHandler(): void {
    if (this.error) {
      this.error = undefined;
    }
  }
}

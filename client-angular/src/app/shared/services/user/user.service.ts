import { Injectable, OnDestroy } from '@angular/core';
import { IUser, IUserData } from '../../interfaces/user';
import { HttpService } from '../http/http.service';
import { Observable, Subscription } from 'rxjs';
import { StorageTokenService } from '../storage/storage-token.service';
import { Router } from '@angular/router';
import { SocketService } from '../socket/socket.service';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/+store';
import {
  clearChats,
  clearUser,
  setError,
  setUser,
} from 'src/app/+store/actions';
import { selectUser } from 'src/app/+store/selectors';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  token: string | null = this.storage.getToken('auth-token');
  user: IUser | undefined;
  subscriptions: Subscription[] = [];

  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private router: Router,
    private sockeService: SocketService,
    private store: Store<IState>
  ) {
    const selectUserSubscription = this.store
      .select(selectUser)
      .subscribe((user) => (this.user = user));
    this.subscriptions.push(selectUserSubscription);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  checkForUserAuthentication() {
    const authToken = this.storage.getToken('auth-token');

    if (authToken) {
      this.getUserByToken(authToken);
    }
  }
  getUserByToken(token: string) {
    try {
        const setUserSubscription = this.httpService
          .get<IUser>('/user', token)
          .subscribe((user) => {
            this.store.dispatch(setUser({ user }));
          });
        this.subscriptions.push(setUserSubscription);
    } catch (error) {
      this.router.navigate(['/error']);
    }
  }

  async login(loginData: {
    email: string;
    password: string;
  }): Promise<void | Error> {
    const userData$: Observable<IUserData> =
      await this.httpService.post<IUserData>('/login', loginData);
    const loginSubscription = await userData$.subscribe({
      next: (data: IUserData) => {
        this.store.dispatch(setUser({ user: data.user }));
        this.storage.storeToken('auth-token', data.token);
        this.user = data.user;
        this.router.navigate(['/chats']);
      },
      error: () => {
        this.store.dispatch(
          setError({ error: 'Incorrect email or password!' })
        );
      },
    });

    this.subscriptions.push(loginSubscription);
  }

  logout() {
    this.storage.deleteToken('auth-token');
    this.router.navigate(['/login']);
    this.sockeService.disconnect();
    this.store.dispatch(clearUser());
    this.store.dispatch(clearChats());
  }
}

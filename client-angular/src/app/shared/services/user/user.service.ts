import { Injectable } from '@angular/core';
import { IUser, IUserData } from '../../interfaces/user';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';
import { StorageTokenService } from '../storage/storage-token.service';
import { Router } from '@angular/router';
import { SocketService } from '../socket/socket.service';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/+store';
import { clearChats, clearCurrentChat, clearUser } from 'src/app/+store/actions';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  token: string | null = this.storage.getToken('auth-token');
  user: IUser | undefined;

  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
    private router: Router,
    private sockeService: SocketService,
    private store: Store<IState>
  ) {
    if (this.storage.getToken('auth-token')) {
      this.getUserByToken(this.storage.getToken('auth-token')!);
    }
  }

  getUserByToken(token: string): Observable<IUser> | void {
    try {
      return this.httpService.get<IUser>('/user', token);
    } catch (error) {
      this.router.navigate(['/error']);
    }
  }

  login(loginData: { email: string; password: string }): Observable<IUserData> {
    return this.httpService.post<IUserData>('/login', loginData);
  }

  logout() {
    this.storage.deleteToken('auth-token');
    this.router.navigate(['/login']);
    this.sockeService.disconnect();
    this.store.dispatch(clearCurrentChat());
    this.store.dispatch(clearUser());
    this.store.dispatch(clearChats());
  }
}

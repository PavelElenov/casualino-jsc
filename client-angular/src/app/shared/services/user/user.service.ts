import { Injectable } from '@angular/core';
import { IUser, IUserData } from '../../interfaces/user';
import { HttpService } from '../http/http.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: IUser | undefined;
  
  constructor(private http: HttpClient) { }

  login(data: {email: string, password: string}): Observable<IUserData>{
    return this.http.post<IUserData>('/login', data,);
  }
}

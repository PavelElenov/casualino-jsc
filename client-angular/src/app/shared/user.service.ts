import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { IUser } from './interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: IUser | undefined;
  
  constructor(private httpService: HttpService) { }

  login(data: {email: string, password: string}){
    return this.httpService.post('/login', data);
  }
}

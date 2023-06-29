import { Injectable } from '@angular/core';
import { IUser } from '../../interfaces/user';
import { HttpService } from '../http/http.service';


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

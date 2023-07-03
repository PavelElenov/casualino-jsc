import { Injectable, OnInit } from "@angular/core";
import { IUser, IUserData } from "../../interfaces/user";
import { HttpService } from "../http/http.service";
import { Observable } from "rxjs";
import { StorageTokenService } from "../storage/storage-token.service";


@Injectable({
  providedIn: "root"
})
export class UserService{
  token: string | null = this.storage.getToken("auth-token");
  user: IUser | undefined;
  
  constructor(private httpService: HttpService, private storage: StorageTokenService) {
    if(this.storage.getToken("auth-token")){
      this.getUserByToken(this.storage.getToken("auth-token")!);
    }
   }

  getUserByToken(token: string){
    this.httpService.get<IUser>("/user", token).subscribe(user => this.user = user);
  }

  login(data: {email: string, password: string}): Observable<IUserData>{
    return this.httpService.post<IUserData>("/login", data,);
  }
}

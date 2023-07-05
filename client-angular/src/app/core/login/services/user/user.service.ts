import { Injectable } from "@angular/core";
import { IUser, IUserData } from "../../../../shared/interfaces/user";
import { HttpService } from "../http/http.service";
import { Observable } from "rxjs";
import { StorageTokenService } from "../storage/storage-token.service";
import { Router } from "@angular/router";



@Injectable({
  providedIn: "root"
})
export class UserService{
  token: string | null = this.storage.getToken("auth-token");
  user: IUser | undefined;
  
  constructor(private httpService: HttpService, private storage: StorageTokenService, private router: Router) {
    if(this.storage.getToken("auth-token")){
      this.getUserByToken(this.storage.getToken("auth-token")!);
    }
   }

  getUserByToken(token: string): Observable<IUser> | void{
    try{
      return this.httpService.get<IUser>("/user", token);
    }catch(error){
      this.router.navigate(["/error"]);
    }
    
  }

  login(data: {email: string, password: string}): Observable<IUserData>{
    return this.httpService.post<IUserData>("/login", data,);
  }
}

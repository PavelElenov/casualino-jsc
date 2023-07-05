import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { StorageTokenService } from "../../core/login/services/storage/storage-token.service";

@Injectable()
export class AuthGuard{
  constructor(private storage: StorageTokenService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.storage.getToken("auth-token")){
      return true;
    }else{
      return this.router.navigate(["/login"]);
    }
  }
}

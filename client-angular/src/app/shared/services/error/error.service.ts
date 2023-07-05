import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ErrorService {

  constructor() { }

  checkForErrorStatus(status: number): string{
    if(status == 400){
      return "Not Found";
    }else if(status == 401){
      return "Unauthorized";
    }else{
      return "Server Error";
    }
  }
}

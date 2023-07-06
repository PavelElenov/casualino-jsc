import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class StorageTokenService {

  constructor() { }

  storeToken(name:string, value: string): void{
    localStorage.setItem(name, value);
  }

  getToken(name:string): string | null{
    return localStorage.getItem(name);
  }
}

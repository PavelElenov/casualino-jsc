import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { IUserData } from '../../interfaces/user';


interface IHeaders {
  headers: {
    "Content-Type"?: string;
    Authorization?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  APIURL: string = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  get(url: string, token?: string){
    const fetchInit: IHeaders = {
      headers: {},
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    this.http.get(`${this.APIURL}${url}`, { headers: fetchInit.headers }).subscribe(response => {
      console.log(response);
      
    })
  }

  post(url: string, data: any, token?: string){
    const fetchInit: IHeaders = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    return this.http.post(`${this.APIURL}${url}`, data, {headers: fetchInit.headers});
  }

  checkForErrorStatus(status: number){
    if(status == 400){
      throwError(() => 'Not Found');
    }else if(status == 401){
      throwError(() => 'Unauthorized');
    }else{
      throwError(() => 'Server Error');
    }
  }

}

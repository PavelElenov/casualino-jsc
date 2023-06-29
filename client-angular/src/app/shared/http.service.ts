import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { catchError } from "rxjs/operators";
import { IUserData } from './interfaces/user';

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
    // const res = await fetch(`${this.APIURL}${url}`, fetchInit);
    // const data = await res.json();

    // if (res.ok) {
    //   return data;
    // } else {
    //   return this.checkResStatus(res.status);
    // }
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

    return this.http.post<IUserData>(`${this.APIURL}${url}`, data, {headers: fetchInit.headers});

    // const res = await fetch(`${this.APIURL}${url}`, fetchInit);
    // const resData = await res.json();

    // if (res.ok) {
    //   return resData;
    // } else {
    //   return this.checkResStatus(res.status);
    // }
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

import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { throwError, Observable, catchError } from "rxjs";
import { IState } from "src/app/+store";
import { setError } from "src/app/+store/actions";
import { IUserData } from "../../../../shared/interfaces/user";
import { ErrorService } from "../error/error.service";

interface IHeaders {
  headers: {
    "Content-Type"?: string;
    Authorization?: string;
  };
}

@Injectable({
  providedIn: "root",
})
export class HttpService {
  APIURL: string = "http://localhost:3000";

  constructor(private http: HttpClient, private errorService: ErrorService) {}

  get<T>(url: string, token?: string): Observable<T> {
    const fetchInit: IHeaders = {
      headers: {},
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    return this.http
      .get<T>(`${this.APIURL}${url}`, { headers: fetchInit.headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(
            () => new Error(this.errorService.checkForErrorStatus(error.status))
          );
        })
      );
  }

  post<T>(url: string, data: any, token?: string): Observable<T> {
    const fetchInit: IHeaders = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    return this.http
      .post<T>(`${this.APIURL}${url}`, data, { headers: fetchInit.headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(
            () => new Error(this.errorService.checkForErrorStatus(error.status))
          );
        })
      );
  }

  delete(url: string, token?: string): Observable<any> {
    const fetchInit: IHeaders = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      fetchInit.headers["Authorization"] = token;
    }

    return this.http
      .delete(`${this.APIURL}${url}`, { headers: fetchInit.headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(
            () => new Error(this.errorService.checkForErrorStatus(error.status))
          );
        })
      );
  }
}

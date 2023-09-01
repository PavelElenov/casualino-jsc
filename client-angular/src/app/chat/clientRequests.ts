import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { IMessage } from '../shared/interfaces/message';
import { HttpService } from '../shared/services/http/http.service';
import { StorageTokenService } from '../shared/services/storage/storage-token.service';

@Injectable({
  providedIn: 'root',
})
export class ClientRequests {
  constructor(
    private storage: StorageTokenService,
    private httpService: HttpService
  ) {}
  getMessages<T>(url: string): Observable<T> {
    return this.httpService
      .get<T>(url, this.storage.getToken('auth-token')!)
      .pipe(take(1));
  }
}

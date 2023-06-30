import { Injectable } from '@angular/core';
import { HttpService } from '../shared/services/http/http.service';
import { StorageTokenService } from '../shared/services/storage/storage-token.service';
import { HttpClient } from '@angular/common/http';
import { IConversation } from '../shared/interfaces/message';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private httpService: HttpService, private storage: StorageTokenService, private http: HttpClient) { }

  getAllChats(): Observable<IConversation[]>{
    return this.http.get<IConversation[]>('http://localhost:3000/conversations', {headers: {
      'Authorization': this.storage.getToken('auth-token')!
    }})
  };

  getChatByName(chatName: string){
    return this.http.get<IConversation>(`http://localhost:3000/conversations/${chatName}`);
  }
}

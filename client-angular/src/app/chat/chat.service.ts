import { Injectable } from "@angular/core";
import { HttpService } from "../shared/services/http/http.service";
import { StorageTokenService } from "../shared/services/storage/storage-token.service";
import { IConversation } from "../shared/interfaces/message";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ChatService {
  constructor(private httpService: HttpService, private storage: StorageTokenService,) { }

  getAllChats(): Observable<IConversation[]>{
    return this.httpService.get<IConversation[]>("/conversations", this.storage.getToken("auth-token")!);
  };

  getChatByName(chatName: string){
    return this.httpService.get<IConversation>(`/conversations/${chatName}`, this.storage.getToken("auth-token")!);
  }


}

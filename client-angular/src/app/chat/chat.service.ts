import { Injectable } from "@angular/core";
import { HttpService } from "../shared/services/http/http.service";
import { StorageTokenService } from "../shared/services/storage/storage-token.service";
import { IConversation } from "../shared/interfaces/message";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  constructor(
    private httpService: HttpService,
    private storage: StorageTokenService,
  ) {}

  getAllChats(): Observable<IConversation[]> {
    return this.httpService.get<IConversation[]>(
      "/conversations",
      this.storage.getToken("auth-token")!
    );
  }

  getChatByName(chatName: string): Observable<IConversation> {
    return this.httpService.get<IConversation>(
      `/conversations/${chatName}`,
      this.storage.getToken("auth-token")!
    );
  }

  deleteChat(name: string): Observable<any> {
    return this.httpService.delete(
      `/conversations/${name}`,
      this.storage.getToken("auth-token")!
    );
  }
  deleteMessage(currentChatName: string, messageText: string): Observable<any> {
    return this.httpService.delete(
      `/conversations/${currentChatName}/messages/${messageText}`,
      this.storage.getToken("auth-token")!
    );
  }
  addChat(chat: IConversation): Observable<any> {
    return this.httpService.post(
      "/conversations",
      { chat },
      this.storage.getToken("auth-token")!
    );
  }
}

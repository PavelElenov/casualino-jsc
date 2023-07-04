import { Injectable } from "@angular/core";
import { HttpService } from "../http/http.service";


@Injectable({
  providedIn: "root"
})
export class TimeService {
  time: number = 0;
  timeDifference!: number;
  serveTimeIsAhead!: boolean;
  constructor(private httpService: HttpService) { 
  }

  getClientCurrentTime(): number {
    const date = new Date();
    const currentTime = date.getHours() * 60 + date.getMinutes();
    return currentTime;
  }

  getCurrentTimeInMinutes(): number {
    const currentTime:number = this.getClientCurrentTime();
    const time = this.serveTimeIsAhead ? currentTime + this.timeDifference : currentTime - this.timeDifference;
    return time;
  }

  getHowLongAgoMessageWasWritten(
    messageTime: number,
    currentTime: number
  ): string {
    const difference = currentTime - messageTime;

    if (difference < 1) {
      return "less than a minute ago";
    } else if (difference < 60) {
      return `${difference} minutes ago`;
    } else {
      return `${Math.floor(difference / 60)} hours ago`;
    }
  }

  getServerTime(): void{
    this.httpService.get<number>("/time").subscribe(serverTime => {
      const currentTime: number = this.getClientCurrentTime();
      this.timeDifference = Math.abs(currentTime - serverTime);
      serverTime > currentTime ? this.serveTimeIsAhead = true : this.serveTimeIsAhead = false;
    })
  }
}

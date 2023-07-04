import { Injectable } from "@angular/core";


@Injectable({
  providedIn: "root"
})
export class TimeService {
  time: number = 0;
  constructor() { 
    
    setInterval(() => this.setTime(), 60 * 1000);
    
  }
  setTime(): void{
    this.time += 1;
  }

  getCurrentTimeInMinutes(): number {
    return this.time;
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
}

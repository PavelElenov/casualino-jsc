import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor() { }

  getCurrentTimeInMinutes(): number {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes;
  }

  getHowLongAgoMessageWasWritten(
    messageTime: number,
    currentTime: number
  ): string {
    const difference = currentTime - messageTime;
    console.log(currentTime, messageTime);
    

    if (difference < 1) {
      return "less than a minute ago";
    } else if (difference < 60) {
      return `${difference} minutes ago`;
    } else {
      return `${Math.floor(difference / 60)} hours ago`;
    }
  }
}

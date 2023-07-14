import { Injectable, NgZone } from '@angular/core';
import { PopupService } from '../popup/popup.service';

@Injectable({
  providedIn: 'root',
})
export class UserIsActiveService {
  isActive: boolean = false;
  domElement!: HTMLElement;

  constructor(private popupService: PopupService, private ngZone: NgZone) {}

  checkForUserActivity(domElement: HTMLElement) {
    this.domElement = domElement;
    this.ngZone.runOutsideAngular(() => {
      this.domElement.addEventListener('click', () => {
        this.isActive = true;
      });
    });

    setTimeout(() => {
      if(this.isActive == false){
        console.log("User is not active");
        this.popupService.showPopup({text: "Are you here?", buttons:[
          {
            text: "Yes",
            onClickFunc: () => {
              this.popupService.closePopup();
              this.checkForUserActivity(this.domElement);
            }
          }
        ]})
      
      }else{
        console.log("User is active");
        this.isActive = false;
        this.checkForUserActivity(this.domElement);

      }
      
    }, 600000);
  }
}

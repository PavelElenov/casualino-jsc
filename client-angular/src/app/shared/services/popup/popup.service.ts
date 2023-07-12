import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { IPopupData } from '../../interfaces/popupData';
import { PopupComponent } from '../../popup/popup.component';

@Injectable()
export class PopupService {
  popupRef!: ComponentRef<PopupComponent> ;
  constructor() {}

  showPopup(container: ViewContainerRef, popupData: IPopupData) {
    this.popupRef = container.createComponent(PopupComponent);
    this.popupRef.setInput("text", popupData.text);
    this.popupRef.setInput("buttons", popupData.buttons);
  }

  closePopup() {
    this.popupRef.destroy();
  }
}

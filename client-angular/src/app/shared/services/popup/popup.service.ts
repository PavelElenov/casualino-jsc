import { ApplicationRef, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { IPopupData } from '../../interfaces/popupData';
import { PopupComponent } from '../../popup/popup.component';

@Injectable()
export class PopupService {
  popupRef!: ComponentRef<PopupComponent> ;

  constructor(private appRef: ApplicationRef) {}

  showPopup(popupData: IPopupData, container?: ViewContainerRef) {
    const currentContainer: ViewContainerRef = container ? container : this.appRef.components[0].instance.container;
    this.popupRef = currentContainer.createComponent(PopupComponent);
    this.popupRef.setInput("text", popupData.text);
    this.popupRef.setInput("buttons", popupData.buttons);
  }

  closePopup() {
    this.popupRef.destroy();
  }
}

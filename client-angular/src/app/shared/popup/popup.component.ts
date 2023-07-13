import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IButton } from '../interfaces/button';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  @Input() text!: string;
  @Input() buttons!: IButton[];

  popup!: HTMLElement;

  ngOnInit(): void {
    this.popup = document.querySelector('.section--popup')!;
    this.popup.classList.add('open');
  }

  buttonClickHandler(listener: Function) {
    this.popup.classList.remove('open');
    this.popup.classList.add('close');
    this.popup.addEventListener('animationend', () => {
      this.popup.classList.remove('close');
      listener();
    });
  }
}

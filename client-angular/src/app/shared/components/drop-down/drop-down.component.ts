import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

const openClose = trigger("openClose", [
  state("open",style({
    display: "block",
    transform: "rotateX(360deg)"
  })),
  state("close", style({
    display: "block",
    transform: "scaleX(0)"
  })),
  transition("* => open", [animate("500ms ease-in-out")]),
  transition("open => close", [animate("500ms ease-in-out")]),
])

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [openClose]
})
export class DropDownComponent implements AfterViewInit {
  @Output() changeSelectedElement = new EventEmitter<string>();
  @ViewChild('content', { static: false }) contentRef!: ElementRef;
  selectedItem: HTMLElement | undefined;
  @ViewChild('selectedValue', { static: false }) selectedValueRef!: ElementRef;
  contentState: string = "";
  isOpen: boolean = false;
  constructor() {}
  ngAfterViewInit(): void {
    const children: HTMLElement[] = this.contentRef.nativeElement.children;

    for (let child of children) {
      child.addEventListener(child.getAttribute("event")!, (event: Event) => {
        if(this.selectedItem){
          this.selectedItem.style.background = "white";
          this.selectedItem.style.color = "black";
        }

        this.selectedItem = event.target as HTMLElement;
        this.selectedItem.style.background = 'grey';
        this.selectedItem.style.color = 'white';

        if (this.selectedValueRef.nativeElement.innerText !== this.selectedItem.innerHTML) {

          this.selectedValueRef.nativeElement.innerHTML = this.selectedItem.innerText;
          this.changeSelectedElement.emit(this.selectedItem.innerText);
        }

        this.clickHandler();
      });
    }
  }

  clickHandler() {
    // this.contentState == "" ? this.contentState = "open" : this.contentState = "close";
    // console.log(this.contentState);
    
    // if(this.contentState == "close"){
    //   setTimeout(() => {
    //     this.contentState = "";
    //     console.log("Animation end", this.contentState);
    //   }, 500);
    // }
    
    this.isOpen = !this.isOpen;
    this.addOpenOrCloseAnimation(this.isOpen);
  }

  addOpenOrCloseAnimation(isOpen: boolean) {
    let className: string;
    if (isOpen) {
      className = 'open';
    } else {
      className = 'close';
      this.contentRef.nativeElement.classList.remove('open');
      this.contentRef.nativeElement.addEventListener(
        'animationend',
        () => {
          this.contentRef.nativeElement.classList.remove('close');
        },
        { once: true }
      );
    }

    this.contentRef.nativeElement.classList.add(className);
  }
}

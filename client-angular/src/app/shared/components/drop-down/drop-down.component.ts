import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  Input,
  ContentChildren,
  AfterContentInit,
  QueryList,
} from '@angular/core';

const openClose = trigger('openClose', [
  state(
    'open',
    style({
      display: 'block',
    })
  ),
  transition('* => open', [
    style({
      display: 'block',
    }),
    animate(
      '500ms ease-in-out',
      keyframes([
        style({
          transform: 'rotateY(360deg)',
        }),
      ])
    ),
  ]),
  transition('open => close', [
    style({
      display: 'block',
    }),
    animate(
      '500ms ease-in-out',
      keyframes([
        style({
          transform: 'scaleX(0)',
        }),
      ])
    ),
  ]),
]);

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [openClose],
})
export class DropDownComponent implements AfterContentInit {
  @Input() defaultSelectedValue: string | undefined;
  @Output() changeSelectedElement = new EventEmitter<string>();
  @ViewChild('content', { static: false }) contentRef!: ElementRef;
  selectedItem: HTMLElement | undefined;
  @ViewChild('selectedValue', { static: false }) selectedValueRef!: ElementRef;
  contentState: string = '';

  @ContentChildren('option') options!: QueryList<ElementRef>;

  attributeName: string = 'drop-down-option-has-event'; // attribute name which need add
  constructor() {}

  ngAfterContentInit(): void {
    //add unique attribute and compore by anttribute
    this.options?.map((option: ElementRef) => {
      const optionElement: HTMLElement = option.nativeElement;
      optionElement.setAttribute(this.attributeName, '');

      optionElement.addEventListener(
        optionElement.getAttribute('event')!,
        (event: Event) => this.eventListenerCallback(event)
      );
    });
    
    this.options!.changes.subscribe((options: QueryList<ElementRef>) => {
      options.map((option: ElementRef) => {
        const optionElement: HTMLElement = option.nativeElement;
        if (optionElement.getAttribute(this.attributeName) == null) {
          optionElement.setAttribute(this.attributeName, '');

          optionElement.addEventListener(
            optionElement.getAttribute('event')!,
            (event: Event) => this.eventListenerCallback(event)
          );
        }
      });
    });
  }

  eventListenerCallback(event: Event) {
    if (this.selectedItem) {
      this.unHighlightElement(this.selectedItem);
    }

    this.selectedItem = event.target as HTMLElement;
    this.highlightElement(this.selectedItem);

    if (
      this.selectedValueRef.nativeElement.innerText !==
      this.selectedItem.innerHTML
    ) {
      this.selectedValueRef.nativeElement.innerHTML =
        this.selectedItem.innerText;
      this.changeSelectedElement.emit(
        this.selectedItem.innerText.replace(/\s/g, '')
      );
    }

    this.clickHandler();
  }

  highlightElement(element: HTMLElement): void {
    element.style.background = 'grey';
    element.style.color = 'white';
  }

  unHighlightElement(element: HTMLElement): void {
    element.style.background = 'white';
    element.style.color = 'black';
  }

  clickHandler() {
    this.contentState == ''
      ? (this.contentState = 'open')
      : (this.contentState = 'close');

    if (this.contentState == 'close') {
      setTimeout(() => {
        this.contentState = '';
      }, 500);
    }
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

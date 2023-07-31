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
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  ContentChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ShareDataDirective } from 'src/app/chat/directives/share-user-data-directive.directive';
import { IUser } from '../../interfaces/user';

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
export class DropDownComponent implements AfterContentInit, OnDestroy {
  @Input() defaultSelectedValue: any | undefined;
  @Output() changeSelectedElement = new EventEmitter<any>();
  @ViewChild('content', { static: false }) contentRef!: ElementRef;
  @ContentChildren(ShareDataDirective) data!: QueryList<ShareDataDirective>;
  selectedItem: HTMLElement | undefined;
  contentState: string = '';
  attributeHasEventName: string = 'drop-down-option-has-event';
  subscriptions: Subscription[] = [];
  constructor(private changeDetection: ChangeDetectorRef) {}
  ngOnDestroy(): void {
    this.subscriptions.map((s) => s.unsubscribe());
  }

  ngAfterContentInit(): void {
    if (this.defaultSelectedValue) {
      const defaultSelectedValueDirective: ShareDataDirective = this.data.find(
        (d) => d.data == this.defaultSelectedValue
      )!;
      this.setSelectedElement(
        defaultSelectedValueDirective.el.nativeElement,
        defaultSelectedValueDirective.data
      );
    }

    this.data?.forEach((d: ShareDataDirective) => {
      const optionElement: HTMLElement = d.el.nativeElement;
      optionElement.setAttribute(this.attributeHasEventName, '');

      optionElement.addEventListener(
        optionElement.getAttribute('event')!,
        (event: Event) => this.eventListenerCallback(event)
      );
    });

    const changeSubscription = this.data!.changes.subscribe(
      (data: QueryList<ShareDataDirective>) => {
        let selectedItemIsDeleted: boolean = true;
        data.forEach((d: ShareDataDirective) => {
          const optionElement: HTMLElement = d.el.nativeElement;

          if (optionElement == this.selectedItem) {
            selectedItemIsDeleted = false;
          }

          if (optionElement.getAttribute(this.attributeHasEventName) == null) {
            optionElement.setAttribute(this.attributeHasEventName, '');

            optionElement.addEventListener(
              optionElement.getAttribute('event')!,
              (event: Event) => this.eventListenerCallback(event)
            );
          }
        });

        if (selectedItemIsDeleted) {
          this.selectedItem = undefined;
        }
      }
    );
    this.subscriptions.push(changeSubscription);
  }

  eventListenerCallback(event: Event) {
    const currentElement: HTMLElement = event.target as HTMLElement;
    const elementDirective: ShareDataDirective = this.data.find(
      (d) => d.el.nativeElement == currentElement
    )!;
    this.setSelectedElement(
      elementDirective.el.nativeElement,
      elementDirective.data
    );

    this.clickHandler();
  }

  setSelectedElement(element: HTMLElement, data: any) {
    if (this.selectedItem !== element) {
      if (this.selectedItem) {
        this.unHighlightElement(this.selectedItem);
      }

      this.changeSelectedElement.emit(data);
      this.highlightElement(element);
      this.selectedItem = element;
    }
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
    this.changeDetection.detectChanges();

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

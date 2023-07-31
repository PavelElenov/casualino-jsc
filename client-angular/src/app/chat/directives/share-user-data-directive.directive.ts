import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appShareDataDirective]'
})
export class ShareDataDirective implements OnInit{
  @Input("appShareDataDirective") data!: any;

  constructor(public el: ElementRef) { }

  ngOnInit(): void{
    this.el.nativeElement.setAttribute("value", JSON.stringify(this.data));
  }
}

import { Directive, Input, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[widget]',
  standalone: true
})
export class WidgetDirective {
  @Input() widget = '';

  constructor(public viewContainerRef: ViewContainerRef) {}
}

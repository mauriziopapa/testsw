import { Component } from '@angular/core';
import { AbstractDashboardComponent } from '../abstract-dashboard/abstract-dashboard.component';

@Component({
  selector: 'acquisti',
  templateUrl: './acquisti.component.html',
  styleUrls: ['./acquisti.component.scss']
})
export class AcquistiComponent extends AbstractDashboardComponent {
  /* override setKpiRowHeight() {
    switch (this.cols) {
      case '1':
        this.rowHeight = 33;
        break;
      case '2':
        this.rowHeight = 20.3;
        break;
      case '3':
        this.rowHeight = 15.8;
        break;
      case '4':
        this.rowHeight = 13.8;
        break;
      default:
        this.rowHeight = 12.5;
        break;
    }
  } */
}

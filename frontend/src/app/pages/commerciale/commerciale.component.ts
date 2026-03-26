import { Component } from '@angular/core';

import { AbstractDashboardComponent } from '../abstract-dashboard/abstract-dashboard.component';

@Component({
    selector: 'commerciale',
    templateUrl: './commerciale.component.html',
    styleUrls: ['./commerciale.component.scss'],
    standalone: false
})
export class CommercialeComponent extends AbstractDashboardComponent {
  /* override setKpiRowHeight() {
    switch (this.cols) {
      case '1':
        this.rowHeight = 33;
        break;
      case '2':
        this.rowHeight = 18;
        break;
      case '3':
        this.rowHeight = 13.5;
        break;
      case '4':
        this.rowHeight = 11;
        break;
      default:
        this.rowHeight = 12.5;
        break;
    }
  } */
}

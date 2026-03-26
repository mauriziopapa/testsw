import { Component } from '@angular/core';
import { AbstractDashboardComponent } from '../abstract-dashboard/abstract-dashboard.component';

@Component({
  selector: 'induzione',
  templateUrl: './induzione.component.html',
  styleUrls: ['./induzione.component.scss']
})
export class InduzioneComponent extends AbstractDashboardComponent {
  /* override setKpiRowHeight() {
    switch (this.cols) {
      case '1':
        this.rowHeight = 33.5;
        break;
      case '2':
        this.rowHeight = 18.5;
        break;
      case '3':
        this.rowHeight = 15.5;
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

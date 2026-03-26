import { Component } from '@angular/core';
import { AbstractDashboardComponent } from '../abstract-dashboard/abstract-dashboard.component';

@Component({
    selector: 'produzione',
    templateUrl: './produzione.component.html',
    styleUrls: ['./produzione.component.scss'],
    standalone: false
})
export class ProduzioneComponent extends AbstractDashboardComponent {}

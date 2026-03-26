import { Component } from '@angular/core';
import { AbstractDashboardComponent } from '../abstract-dashboard/abstract-dashboard.component';

@Component({
    selector: 'direzione',
    templateUrl: './direzione.component.html',
    styleUrls: ['./direzione.component.scss'],
    standalone: false
})
export class DirezioneComponent extends AbstractDashboardComponent {}

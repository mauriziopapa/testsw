import { Component } from '@angular/core';
import { AbstractDashboardComponent } from '../abstract-dashboard/abstract-dashboard.component';

@Component({
    selector: 'pianificazione',
    templateUrl: './pianificazione.component.html',
    styleUrls: ['./pianificazione.component.scss'],
    standalone: false
})
export class PianificazioneComponent extends AbstractDashboardComponent {}

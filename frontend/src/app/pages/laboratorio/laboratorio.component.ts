import { Component } from '@angular/core';
import { AbstractDashboardComponent } from '../abstract-dashboard/abstract-dashboard.component';

@Component({
    selector: 'laboratorio',
    templateUrl: './laboratorio.component.html',
    styleUrls: ['./laboratorio.component.scss'],
    standalone: false
})
export class LaboratorioComponent extends AbstractDashboardComponent {}

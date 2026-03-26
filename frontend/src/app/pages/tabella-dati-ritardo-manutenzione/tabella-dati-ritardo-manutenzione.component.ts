import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RitardoManutenzioneService } from 'src/app/services/rit-manutenzione.service';
import { AbstractDataWithMonthsComponent } from '../abstract-table-data-with-months/abstract-table-data-with-months.component';

@Component({
    selector: 'tabella-dati-ritardo-manutenzione',
    templateUrl: './tabella-dati-ritardo-manutenzione.component.html',
    styleUrls: ['./tabella-dati-ritardo-manutenzione.component.scss'],
    standalone: false
})
export class TabellaDatiRitardoManutenzioneComponent extends AbstractDataWithMonthsComponent {
  override tableName = 'tabella-ritardo-manutenzione';

  constructor(
    private ritardoManutenzioneService: RitardoManutenzioneService,
    snackBar: MatSnackBar
  ) {
    super(snackBar);
  }

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.ritardoManutenzioneService
      .getData(tableFilters.tableYear, tableFilters.maintenanceType)
      .subscribe((response: any) => {
        this.setRows(response);
      });
  }

  calcKpi(event: any) {}

  onSubmit() {
    this.ritardoManutenzioneService.postData(this.kpi_rows).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }
}

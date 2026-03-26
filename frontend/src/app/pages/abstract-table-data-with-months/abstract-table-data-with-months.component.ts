import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';
import { TableFilters } from 'src/app/models/table-filters';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';

@Component({
    selector: 'abstract-table',
    template: ` <p></p> `,
    styles: [],
    standalone: false
})
export abstract class AbstractDataWithMonthsComponent {
  tableName = '';

  anni = new Array<string>();
  mesi: any;
  kpi_rows: any;

  tableFilters = new TableFilters();

  constructor(private snackBar: MatSnackBar) {}

  abstract searchByTableFilters(tableFilters: any): void;

  resetVariabili(tableFilters: any) {
    this.tableFilters.year = tableFilters.tableYear;
    this.tableFilters.month = tableFilters.tableMonth;
  }

  setRows(rows: any): void {
    // Prendo l'anno per l'intestazione delle righe
    this.anni = rows.anni.map((anno: any) => anno);
    // Prendo i mesi per creare le colonne
    this.mesi = rows.mesi;
    // Qui ci sono i valori per ogni kpi
    this.kpi_rows = rows.kpi_rows;
  }

  abstract calcKpi(event: any): void;

  abstract onSubmit(): void;

  protected openFailSnackBar() {
    this.snackBar.openFromComponent(FailSnackbarComponent, {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['failUpdated']
    });
  }

  protected openSuccessSnackBar() {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      duration: 1000,
      verticalPosition: 'top',
      panelClass: ['successUpdated']
    });
  }
}

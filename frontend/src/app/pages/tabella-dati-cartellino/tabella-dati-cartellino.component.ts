import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartellinoService } from 'src/app/services/cartellino.service';
import { AbstractDataWithMonthsComponent } from '../abstract-table-data-with-months/abstract-table-data-with-months.component';

@Component({
    selector: 'tabella-dati-cartellino',
    templateUrl: './tabella-dati-cartellino.component.html',
    styleUrls: ['./tabella-dati-cartellino.component.scss'],
    standalone: false
})
export class TabellaDatiCartellinoComponent extends AbstractDataWithMonthsComponent {
  override tableName = 'tabella-cartellino';

  constructor(private cartellinoService: CartellinoService, snackBar: MatSnackBar) {
    super(snackBar);
  }

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.cartellinoService.getData(tableFilters.tableYear).subscribe((response: any) => {
      this.setRows(response);
    });
  }

  calcKpi(event: any) {}

  onSubmit() {
    this.cartellinoService.postData(this.kpi_rows).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }
}

import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttivitaManutenzioneService } from 'src/app/services/attivita-manutenzione.service';
import { AbstractDataWithMonthsComponent } from '../abstract-table-data-with-months/abstract-table-data-with-months.component';

const MANUTENZIONE = 7;
const RITARDO_MP = 8;

const PERC_TOTALI = 4;

@Component({
  selector: 'tabella-dati-manutenzione',
  templateUrl: './tabella-dati-manutenzione.component.html',
  styleUrls: ['./tabella-dati-manutenzione.component.scss']
})
export class TabellaDatiManutenzioneComponent extends AbstractDataWithMonthsComponent {
  override tableName = 'tabella-manutenzione';

  constructor(
    private attivitaManutenzioneService: AttivitaManutenzioneService,
    snackBar: MatSnackBar
  ) {
    super(snackBar);
  }

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.attivitaManutenzioneService.getData(tableFilters.tableYear).subscribe((response: any) => {
      this.setRows(response);
    });
  }

  calcKpi(event: any) {
    const { kpi_row, mese } = event;
    switch (kpi_row.id) {
      case 4:
        this.calcKpi4(kpi_row.id, mese);
        break;
      default:
        break;
    }
  }

  calcKpi4(id: any, mese: any): void {
    const manutenzione = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == MANUTENZIONE).valori[mese.id_mese - 1].val
    );
    const ritardo_mp = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == RITARDO_MP).valori[mese.id_mese - 1].val
    );

    const perc_totali = this.kpi_rows.find((kpi_row: any) => kpi_row.id == PERC_TOTALI).valori[
      mese.id_mese - 1
    ];

    if (manutenzione > 0) {
      perc_totali.val = (ritardo_mp / manutenzione).toFixed(3);
    }
  }

  onSubmit() {
    this.attivitaManutenzioneService.postData(this.kpi_rows).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }
}

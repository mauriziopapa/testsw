import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DirezioneService } from 'src/app/services/direzione.service';
import { AbstractDataWithMonthsComponent } from '../abstract-table-data-with-months/abstract-table-data-with-months.component';

const FATTURATO = 1;
const ONERI_FINANZIARI = 2;
const INDEBITAMENTO = 3;
const INSOLUTI = 4;
const SOFFERENZE = 5;

const PERC_INSOLUTI = 8;
const PERC_SOFFERENZE = 9;

@Component({
  selector: 'tabella-dati-direzione',
  templateUrl: './tabella-dati-direzione.component.html',
  styleUrls: ['./tabella-dati-direzione.component.scss']
})
export class TabellaDatiDirezioneComponent extends AbstractDataWithMonthsComponent {
  override tableName = 'tabella-direzione';

  constructor(private direzioneService: DirezioneService, snackBar: MatSnackBar) {
    super(snackBar);
  }

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.direzioneService
      .getData(tableFilters.tableYearFrom, tableFilters.tableYearTo)
      .subscribe((response: any) => {
        this.setRows(response);
      });
  }

  calcKpi(event: any) {
    const { kpi_row, mese, anno } = event;
    switch (kpi_row.id) {
      case 8:
        this.calcKpi8(kpi_row.id, mese, anno);
        break;
      case 9:
        this.calcKpi9(kpi_row.id, mese, anno);
        break;
      default:
        break;
    }
  }

  calcKpi8(id: any, mese: any, anno: any): void {
    const fatturato = parseInt(
      this.kpi_rows
        .find((kpi_row: any) => kpi_row.id == FATTURATO)
        .valori.find((valore: any) => valore.anno === anno && valore.sem === mese.id_mese).val
    );
    const insoluti = parseInt(
      this.kpi_rows
        .find((kpi_row: any) => kpi_row.id == INSOLUTI)
        .valori.find((valore: any) => valore.anno === anno && valore.sem === mese.id_mese).val
    );

    const numeratore = insoluti / 1.1;

    const perc_insoluti = this.kpi_rows
      .find((kpi_row: any) => kpi_row.id == PERC_INSOLUTI)
      .valori.find((valore: any) => valore.anno === anno && valore.sem === mese.id_mese);

    if (fatturato > 0) {
      perc_insoluti.val = (numeratore / fatturato).toFixed(3);
    }
  }

  calcKpi9(id: any, mese: any, anno: any): void {
    const fatturato = parseInt(
      this.kpi_rows
        .find((kpi_row: any) => kpi_row.id == FATTURATO)
        .valori.find((valore: any) => valore.anno === anno && valore.sem === mese.id_mese).val
    );
    const sofferenze = parseInt(
      this.kpi_rows
        .find((kpi_row: any) => kpi_row.id == SOFFERENZE)
        .valori.find((valore: any) => valore.anno === anno && valore.sem === mese.id_mese).val
    );

    const denominatore = fatturato * 1.1;

    const perc_sofferenze = this.kpi_rows
      .find((kpi_row: any) => kpi_row.id == PERC_SOFFERENZE)
      .valori.find((valore: any) => valore.anno === anno && valore.sem === mese.id_mese);

    if (denominatore > 0) {
      perc_sofferenze.val = (sofferenze / denominatore).toFixed(3);
    }
  }

  onSubmit() {
    this.direzioneService.postData(this.kpi_rows).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }
}

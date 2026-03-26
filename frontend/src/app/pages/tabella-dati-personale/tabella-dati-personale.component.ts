import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PersonaleService } from 'src/app/services/personale.service';
import { AbstractDataWithMonthsComponent } from '../abstract-table-data-with-months/abstract-table-data-with-months.component';

const TOT_FORMAZIONE = 9;
const TOT_MALATTIA = 10;
const TOT_STRAORDINARI = 11;
const TOT_FERIE_RESIDUE = 12;
const TOT_INFORTUNI = 13;
const TOT_QUASI_INFORTUNI = 14;
const TOT_ORE_LAVORATE = 15;
const N_DIPENDENTI = 16;
const ORE_STANDARD = 17;

const PERC_ASSENTEISMO = 18;
const PERC_STRAORDINARI = 19;
const PERC_FERIE_RESIDUE = 20;
const PERC_INFORTUNI = 21;
const PERC_FORMAZIONE = 22;

@Component({
  selector: 'tabella-dati-personale',
  templateUrl: './tabella-dati-personale.component.html',
  styleUrls: ['./tabella-dati-personale.component.scss']
})
export class TabellaDatiPersonaleComponent extends AbstractDataWithMonthsComponent {
  override tableName = 'tabella-personale';

  constructor(private personaleService: PersonaleService, snackBar: MatSnackBar) {
    super(snackBar);
  }

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.personaleService.getData(tableFilters.tableYear).subscribe((response: any) => {
      this.setRows(response);
    });
  }

  calcKpi(event: any) {
    const { kpi_row, mese } = event;
    switch (kpi_row.id) {
      case 18:
        this.calcKpi18(kpi_row.id, mese);
        break;
      case 19:
        this.calcKpi19(kpi_row.id, mese);
        break;
      case 20:
        this.calcKpi20(kpi_row.id, mese);
        break;
      case 21:
        this.calcKpi21(kpi_row.id, mese);
        break;
      case 22:
        this.calcKpi22(kpi_row.id, mese);
        break;
      default:
        break;
    }
  }

  calcKpi18(id: any, mese: any): void {
    const ore_malattia = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_MALATTIA).valori[mese.id_mese - 1].val
    );
    const ore_lavorate = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_ORE_LAVORATE).valori[mese.id_mese - 1]
        .val
    );

    const perc_assenteismo = this.kpi_rows.find((kpi_row: any) => kpi_row.id == PERC_ASSENTEISMO)
      .valori[mese.id_mese - 1];

    if (ore_lavorate > 0) {
      perc_assenteismo.val = (ore_malattia / ore_lavorate).toFixed(3);
    }
  }

  calcKpi19(id: any, mese: any): void {
    const ore_straordinari = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_STRAORDINARI).valori[mese.id_mese - 1]
        .val
    );
    const ore_lavorate = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_ORE_LAVORATE).valori[mese.id_mese - 1]
        .val
    );

    const perc_straordinari = this.kpi_rows.find((kpi_row: any) => kpi_row.id == PERC_STRAORDINARI)
      .valori[mese.id_mese - 1];

    if (ore_lavorate > 0) {
      perc_straordinari.val = (ore_straordinari / ore_lavorate).toFixed(3);
    }
  }

  calcKpi20(id: any, mese: any): void {
    const ore_standard = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == ORE_STANDARD).valori[mese.id_mese - 1].val
    );
    const ferie_residue = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_FERIE_RESIDUE).valori[mese.id_mese - 1]
        .val
    );

    const perc_ferie = this.kpi_rows.find((kpi_row: any) => kpi_row.id == PERC_FERIE_RESIDUE)
      .valori[mese.id_mese - 1];

    if (ore_standard > 0) {
      perc_ferie.val = (ferie_residue / ore_standard).toFixed(3);
    }
  }

  calcKpi21(id: any, mese: any): void {
    const ore_lavorate = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_ORE_LAVORATE).valori[mese.id_mese - 1]
        .val
    );
    const formazione = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_FORMAZIONE).valori[mese.id_mese - 1]
        .val
    );

    const perc_formazione = this.kpi_rows.find((kpi_row: any) => kpi_row.id == PERC_FORMAZIONE)
      .valori[mese.id_mese - 1];

    if (ore_lavorate > 0) {
      perc_formazione.val = (formazione / ore_lavorate).toFixed(3);
    }
  }

  calcKpi22(id: any, mese: any): void {
    const ore_lavorate = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_ORE_LAVORATE).valori[mese.id_mese - 1]
        .val
    );
    const infortuni = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TOT_INFORTUNI).valori[mese.id_mese - 1].val
    );

    const perc_infortuni = this.kpi_rows.find((kpi_row: any) => kpi_row.id == PERC_INFORTUNI)
      .valori[mese.id_mese - 1];

    if (ore_lavorate > 0) {
      perc_infortuni.val = (infortuni / ore_lavorate).toFixed(3);
    }
  }

  onSubmit() {
    this.personaleService.postData(this.kpi_rows).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }
}

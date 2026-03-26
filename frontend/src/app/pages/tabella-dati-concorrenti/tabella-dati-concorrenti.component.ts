import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConcorrentiService } from 'src/app/services/concorrenti.service';
import { AbstractDataWithMonthsComponent } from '../abstract-table-data-with-months/abstract-table-data-with-months.component';

const FATTURATO = 1;
const UTILE_NETTO = 2;
const COSTO_MANODOPERA = 4;
const COSTO_MP = 5;
const ONERI_FINANZIARI = 6;
const COSTO_BENI_TERZI = 8;
const COSTO_SERVIZI = 10;
const DEBITI_TOTALI = 14;
const TOTALE_PASSIVITA = 16;
const TASSE = 17;

const ROS = 3;
const PERC_ROD = 7;
const PERC_AMMORTAMENTI = 9;
const PERC_COSTO_MANODOPERA = 11;
const PERC_COSTO_MP = 12;
const PERC_COSTO_SERVIZI = 13;
const PERC_INDEBITAMENTO = 15;
const PERC_EBTDA = 18;
const PERC_ROI = 19;

@Component({
  selector: 'tabella-dati-concorrenti',
  templateUrl: './tabella-dati-concorrenti.component.html',
  styleUrls: ['./tabella-dati-concorrenti.component.scss']
})
export class TabellaDatiConcorrentiComponent extends AbstractDataWithMonthsComponent {
  override tableName = 'tabella-concorrenti';

  constructor(private concorrentiService: ConcorrentiService, snackBar: MatSnackBar) {
    super(snackBar);
  }

  searchByTableFilters(tableFilters: any) {
    this.resetVariabili(tableFilters);

    this.concorrentiService
      .getData(tableFilters.tableYearFrom, tableFilters.tableYearTo)
      .subscribe((response: any) => {
        this.setRows(response);
      });
  }

  calcKpi(event: any) {
    const { kpi_row, mese } = event;
    switch (kpi_row.id) {
      case 3:
        this.calcKpi3(kpi_row, mese);
        break;
      case 7:
        this.calcKpi7(kpi_row, mese);
        break;
      case 9:
        this.calcKpi9(kpi_row, mese);
        break;
      case 11:
        this.calcKpi11(kpi_row, mese);
        break;
      case 12:
        this.calcKpi12(kpi_row, mese);
        break;
      case 13:
        this.calcKpi13(kpi_row, mese);
        break;
      case 15:
        this.calcKpi15(kpi_row, mese);
        break;
      case 18:
        this.calcKpi18(kpi_row, mese);
        break;
      case 19:
        this.calcKpi19(kpi_row, mese);
        break;
      default:
        break;
    }
  }

  calcKpi3(row: any, mese: any): void {
    const fatturato = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == FATTURATO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );
    const utile_netto = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == UTILE_NETTO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );

    const ros = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == ROS && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (fatturato > 0) {
      ros.val = (utile_netto / fatturato).toFixed(3);
    }
  }

  calcKpi7(row: any, mese: any): void {
    const debiti_totali = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == DEBITI_TOTALI && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const oneri_finanziari = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == ONERI_FINANZIARI && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const rod = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_ROD && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (debiti_totali > 0) {
      rod.val = (oneri_finanziari / debiti_totali).toFixed(3);
    }
  }

  calcKpi9(row: any, mese: any): void {
    const fatturato = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == FATTURATO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );
    const costo_beni_terzi = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == COSTO_BENI_TERZI && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const perc_ammortamenti = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_AMMORTAMENTI && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (fatturato > 0) {
      perc_ammortamenti.val = (costo_beni_terzi / fatturato).toFixed(3);
    }
  }

  calcKpi11(row: any, mese: any): void {
    const fatturato = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == FATTURATO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );
    const costo_manodopera = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == COSTO_MANODOPERA && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const perc_manodopera = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_COSTO_MANODOPERA && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (fatturato > 0) {
      perc_manodopera.val = (costo_manodopera / fatturato).toFixed(3);
    }
  }

  calcKpi12(row: any, mese: any): void {
    const fatturato = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == FATTURATO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );
    const costo_mp = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == COSTO_MP && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );

    const perc_costo_mp = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_COSTO_MP && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (fatturato > 0) {
      perc_costo_mp.val = (costo_mp / fatturato).toFixed(3);
    }
  }

  calcKpi13(row: any, mese: any): void {
    const fatturato = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == FATTURATO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );
    const costo_servizi = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == COSTO_SERVIZI && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const perc_costo_servizi = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_COSTO_SERVIZI && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (fatturato > 0) {
      perc_costo_servizi.val = (costo_servizi / fatturato).toFixed(3);
    }
  }

  calcKpi15(row: any, mese: any): void {
    const fatturato = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == FATTURATO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );
    const debiti_totali = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == DEBITI_TOTALI && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const perc_indebitamento = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_INDEBITAMENTO && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (fatturato > 0) {
      perc_indebitamento.val = (debiti_totali / fatturato).toFixed(3);
    }
  }

  calcKpi18(row: any, mese: any): void {
    const fatturato = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == FATTURATO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );

    const utile_netto = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == UTILE_NETTO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );

    const tasse = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == TASSE && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );

    const ammortamento = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == COSTO_BENI_TERZI && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const oneri_finanziari = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == ONERI_FINANZIARI && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const perc_ebtda = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_EBTDA && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (fatturato > 0) {
      perc_ebtda.val = (
        (utile_netto + tasse + ammortamento + oneri_finanziari) /
        fatturato
      ).toFixed(3);
    }
  }

  calcKpi19(row: any, mese: any): void {
    const utile_netto = parseInt(
      this.kpi_rows.find((kpi_row: any) => kpi_row.id == UTILE_NETTO && isSameAzienda(kpi_row, row))
        .valori[mese.id_mese - 1].val
    );

    const totale_passivita = parseInt(
      this.kpi_rows.find(
        (kpi_row: any) => kpi_row.id == TOTALE_PASSIVITA && isSameAzienda(kpi_row, row)
      ).valori[mese.id_mese - 1].val
    );

    const perc_roi = this.kpi_rows.find(
      (kpi_row: any) => kpi_row.id == PERC_ROI && isSameAzienda(kpi_row, row)
    ).valori[mese.id_mese - 1];

    if (totale_passivita > 0) {
      perc_roi.val = (utile_netto / totale_passivita).toFixed(3);
    }
  }

  onSubmit() {
    this.concorrentiService.postData(this.kpi_rows).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }
}
function isSameAzienda(kpi_row: any, row: any) {
  return kpi_row.azienda === row.azienda;
}

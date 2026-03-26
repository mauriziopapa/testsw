import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'table-data-with-months',
  templateUrl: './table-data-with-months.component.html',
  styleUrls: ['./table-data-with-months.component.scss']
})
export class TableDataWithMonthsComponent {
  @Input() anni = new Array<string>();
  @Input() mesi: any;
  @Input() kpi_rows: any;
  @Input() can_force: boolean = false;

  @Output() calcKpi = new EventEmitter<any>();

  forced = false;

  inputChanged(kpi: any, mese: string, row: any) {
    // recupero l'anno per individuare la colonna
    const anno = row.anno;
    // il dato è stato cambiato quindi è una forzatura
    row.forzatura_manuale = true;
    if (row.valore == '0') {
      // se è stato reinserito 0 resettiamo la forzatura
      row.forzatura_manuale = false;
    }
    // display alert
    this.forced = true;
    // aggiorno i kpi calcolati
    this.kpi_rows.forEach((kpi_row: any) => {
      if (kpi_row.calcolato) {
        const event = { kpi_row, mese, anno };
        this.calcKpi.emit(event);
      }
    });
  }

  getColorClass(azienda: string): string {
    const trimmed = azienda.trim();
    switch (trimmed) {
      case 'TEMPRA SUD - FRESAGRANDINARIA - CH':
        return 'temprasud';
      case 'UNITRAT S.R.L. - BARI':
        return 'unitrat';
      case 'COLMEGNA SUD SRL - NAPOLI - NA':
        return 'colmegna';
      case 'MC THERM':
        return 'mctherm';
      case 'GENERAL TEMPERING S.R.L. - PESARO':
        return 'general-tempering';
      case 'TTS INTERNATIONAL':
        return 'tts';
      case 'TAT s.r.l. Trattamenti Alta Tecnologia - LATINA':
        return 'tat';
      case 'GR TRATTAMENTI TERMICI  - Pontinia - LT':
        return 'gr';
      default:
        return '';
    }
  }
}

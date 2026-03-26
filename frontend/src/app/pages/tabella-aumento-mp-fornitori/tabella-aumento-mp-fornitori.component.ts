import { Component } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { CurrencyPipe } from '@angular/common';
import { FornitoriService } from 'src/app/services/fornitori.service';
import { AumentoMpFornitore } from 'src/app/models/aumento-mp-fornitore';
import { PercentagePipe } from 'src/app/shared/percent-pipe/percent.pipe';

@Component({
  selector: 'tabella-aumento-mp-fornitori',
  templateUrl: './tabella-aumento-mp-fornitori.component.html',
  styleUrls: ['./tabella-aumento-mp-fornitori.component.scss']
})
export class TabellaAumentoMpFornitoriComponent {
  dataSource: MatTableDataSource<AumentoMpFornitore>;
  columns = [
    {
      columnDef: 'fino_al',
      header: 'Fino al',
      cell: (element: AumentoMpFornitore) => `${element.anno}-${element.mese}`
    },
    {
      columnDef: 'fornitore',
      header: 'Fornitore',
      cell: (element: AumentoMpFornitore) => `${element.fornitore}`
    },
    {
      columnDef: 'materiaPrima',
      header: 'Materia Prima',
      cell: (element: AumentoMpFornitore) => `${element.materiaPrima}`
    },
    {
      columnDef: 'spesaCurr',
      header: 'Spesa Corrente',
      cell: (element: AumentoMpFornitore) => this.currencyPipe.transform(element.spesaCurr, 'EUR')
    },
    {
      columnDef: 'prezzoCurr',
      header: 'Costo Medio Corrente',
      cell: (element: AumentoMpFornitore) =>
        this.currencyPipe.transform(element.prezzoCurr, 'EUR', 'symbol', '1.2-5')
    },
    {
      columnDef: 'spesaPrec',
      header: 'Spesa Precedente',
      cell: (element: AumentoMpFornitore) => this.currencyPipe.transform(element.spesaPrec, 'EUR')
    },
    {
      columnDef: 'prezzoPrec',
      header: 'Costo Medio Precedente',
      cell: (element: AumentoMpFornitore) =>
        this.currencyPipe.transform(element.prezzoPrec, 'EUR', 'symbol', '1.2-5') //{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
    },
    {
      columnDef: 'incremento',
      header: '% Incremento',
      cell: (element: AumentoMpFornitore) => this.percentagePipe.transform(element.incremento)
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(
    private fornitoriService: FornitoriService,
    private currencyPipe: CurrencyPipe,
    private percentagePipe: PercentagePipe
  ) {
    this.dataSource = new MatTableDataSource();
    this.fornitoriService.findAumentoMpFornitori().subscribe((response) => {
      this.dataSource = new MatTableDataSource(response);
    });
  }
}

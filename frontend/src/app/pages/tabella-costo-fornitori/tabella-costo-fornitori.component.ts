import { Component } from '@angular/core';
import { CostoFornitore } from 'src/app/models/costo-fornitore';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { CurrencyPipe } from '@angular/common';
import { FornitoriService } from 'src/app/services/fornitori.service';

@Component({
  selector: 'tabella-costo-fornitori',
  templateUrl: './tabella-costo-fornitori.component.html',
  styleUrls: ['./tabella-costo-fornitori.component.scss']
})
export class TabellaCostoFornitoriComponent {
  dataSource: MatTableDataSource<CostoFornitore>;
  columns = [
    {
      columnDef: 'codice_anagrafica',
      header: 'Codice Anagrafica',
      cell: (element: CostoFornitore) => `${element.CodiceFornitore}`
    },
    {
      columnDef: 'rag_sociale',
      header: 'Ragione Sociale',
      cell: (element: CostoFornitore) => `${element.RagioneSociale}`
    },
    {
      columnDef: 'costo',
      header: 'Costo',
      cell: (element: CostoFornitore) => this.currencyPipe.transform(element.costo, 'EUR')
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(private ClientiService: FornitoriService, private currencyPipe: CurrencyPipe) {
    this.dataSource = new MatTableDataSource();
    this.ClientiService.findAllFornitori().subscribe((fornitori) => {
      this.dataSource = new MatTableDataSource(fornitori);
    });
  }
}

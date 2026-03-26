import { Component } from '@angular/core';
import { ClienteFatturato } from 'src/app/models/cliente-fatturato';
import { ClientiService } from 'src/app/services/clienti.service';
import { MatTableDataSource } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'tabella-fatturato-clienti',
    templateUrl: './tabella-fatturato-clienti.component.html',
    styleUrls: ['./tabella-fatturato-clienti.component.scss'],
    standalone: false
})
export class TabellaFatturatoClientiComponent {
  dataSource: MatTableDataSource<ClienteFatturato>;
  columns = [
    {
      columnDef: 'codice_anagrafica',
      header: 'Codice Anagrafica',
      cell: (element: ClienteFatturato) => `${element.codice_anagrafica}`
    },
    {
      columnDef: 'rag_sociale',
      header: 'Ragione Sociale',
      cell: (element: ClienteFatturato) => `${element.rag_sociale}`
    },
    {
      columnDef: 'fatturato',
      header: 'Fatturato',
      cell: (element: ClienteFatturato) => this.currencyPipe.transform(element.fatturato, 'EUR')
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(private ClientiService: ClientiService, private currencyPipe: CurrencyPipe) {
    this.dataSource = new MatTableDataSource();
    this.ClientiService.findAllClienti().subscribe((clienti) => {
      this.dataSource = new MatTableDataSource(clienti);
    });
  }
}

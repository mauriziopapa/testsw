import { Component } from '@angular/core';
import { RiepilogoCliente } from 'src/app/models/riepilogo-cliente';
import { MatTableDataSource } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';
import { RiepilogoClientiService } from 'src/app/services/riepilogo-clienti.service';

@Component({
    selector: 'tabella-riepilogo-clienti',
    templateUrl: './tabella-riepilogo-clienti.component.html',
    styleUrls: ['./tabella-riepilogo-clienti.component.scss'],
    standalone: false
})
export class TabellaRiepilogoClientiComponent {
  dataSource: MatTableDataSource<RiepilogoCliente>;

  columns = [
    {
      columnDef: 'codice_anagrafica',
      header: 'Codice Anagrafica',
      cell: (element: RiepilogoCliente) => `${element.cod_anagrafica}`
    },
    {
      columnDef: 'rag_sociale',
      header: 'Ragione Sociale',
      cell: (element: RiepilogoCliente) => `${element.rag_sociale}`
    },
    {
      columnDef: 'aumento_listino',
      header: 'Aumento Listino',
      cell: (element: RiepilogoCliente) => `${element.aumento_listino} %`
    },
    {
      columnDef: 'fatturato',
      header: 'Fatturato',
      cell: (element: RiepilogoCliente) => this.currencyPipe.transform(element.fatturato, 'EUR')
    },
    {
      columnDef: 'fatturato_prec',
      header: 'Fatturato Prec',
      cell: (element: RiepilogoCliente) =>
        this.currencyPipe.transform(element.fatturato_prec, 'EUR')
    },
    {
      columnDef: 'fatturato_12m',
      header: 'Fatturato 12 mesi Prec',
      cell: (element: RiepilogoCliente) => this.currencyPipe.transform(element.fatturato_12m, 'EUR')
    },
    {
      columnDef: 'budget',
      header: 'Budget',
      cell: (element: RiepilogoCliente) => this.currencyPipe.transform(element.budget, 'EUR')
    },
    {
      columnDef: 'anno',
      header: 'Anno',
      cell: (element: RiepilogoCliente) => `${element.anno}`
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);
  options: number[] = [];
  selectedValue?: number;


  constructor(private ClientiService: RiepilogoClientiService, private currencyPipe: CurrencyPipe) {
    this.dataSource = new MatTableDataSource();
    this.selectedValue = new Date().getFullYear();
    for (let index = 0; index <= 4; index++) {
      this.options.push(this.selectedValue - index);
    }

    this.ClientiService.findAllClienti(this.selectedValue).subscribe((clienti) => {
      this.dataSource = new MatTableDataSource(clienti);
    });
  }
  onSelect(value: number) {
    this.selectedValue = value;
    if (this.selectedValue) {
      this.ClientiService.findAllClienti(this.selectedValue).subscribe((clienti) => {
        this.dataSource = new MatTableDataSource(clienti);
      });
    }
  }
}

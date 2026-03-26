import { Component } from '@angular/core';
import { TeamsystemOrdini } from 'src/app/models/teamsystem-ordini';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { CurrencyPipe } from '@angular/common';
import { OrdiniTeamSystemService } from 'src/app/services/ordini-teamsystem.service';

@Component({
  selector: 'tabella-teamsystem-ordini-clienti',
  templateUrl: './tabella-ordini-teamsystem.component.html',
  styleUrls: ['./tabella-ordini-teamsystem.component.scss']
})
export class TabellaOrdiniTeamSystemComponent {
  dataSource: MatTableDataSource<TeamsystemOrdini>;
  columns = [
    {
      columnDef: 'IdFornitore',
      header: 'Id Fornitore',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.IdFornitore)
    },
    {
      columnDef: 'DataOrdine',
      header: 'Data Ordine',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.DataOrdine)
    },
    {
      columnDef: 'NumeroOrdine',
      header: 'Numero Ordine',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.NumeroOrdine)
    },
    {
      columnDef: 'DataEvasione',
      header: 'Data Evasione',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.DataEvasione)
    },
    {
      columnDef: 'DataPrevConsegna',
      header: 'Data Prev Consegna',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.DataPrevConsegna)
    },
    {
      columnDef: 'PrezzoProdotto',
      header: 'Prezzo Prodotto',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.PrezzoProdotto)
    },
    {
      columnDef: 'QuantitaOrdinata',
      header: 'Quantita Ordinata',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.QuantitaOrdinata)
    },
    {
      columnDef: 'QuantitaConsegnata',
      header: 'Quantita Consegnata',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.QuantitaConsegnata)
    },
    {
      columnDef: 'CodiceArticolo',
      header: 'Codice Articolo',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.CodiceArticolo)
    },
    {
      columnDef: 'DescrArticolo',
      header: 'Descr Articolo',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.DescrArticolo)
    },
    {
      columnDef: 'Extracosti',
      header: 'Extra Costi',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.Extracosti)
    },
    {
      columnDef: 'StatoOrdine',
      header: 'Stato Ordine',
      cell: (element: TeamsystemOrdini) => this.nullFormatter(element.StatoOrdine)
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);
  options: number[] = [];
  selectedValue?: number;

  constructor(private OrdiniService: OrdiniTeamSystemService, private currencyPipe: CurrencyPipe) {
    this.dataSource = new MatTableDataSource();
    this.selectedValue = new Date().getFullYear();

    for (let index = 0; index <= 4; index++) {
      this.options.push(this.selectedValue - index);
    }
    this.dataSource = new MatTableDataSource();
    this.OrdiniService.findAllOrdini(this.selectedValue).subscribe((ordini) => {
      this.dataSource = new MatTableDataSource(ordini);
    });
  }
  nullFormatter(value: any) {
    return value ? `${value}` : '-';
  }

  onSelect(value: number) {
    this.selectedValue = value;
    if (this.selectedValue) {
      this.OrdiniService.findAllOrdini(this.selectedValue).subscribe((ordini) => {
        this.dataSource = new MatTableDataSource(ordini);
      });
    }
  }
}

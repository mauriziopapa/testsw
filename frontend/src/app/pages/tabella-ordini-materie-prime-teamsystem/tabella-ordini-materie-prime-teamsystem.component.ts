import { Component } from '@angular/core';
import { TeamsystemOrdiniMateriePrime } from 'src/app/models/teamsystem-ordini-materie-prime';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { CurrencyPipe } from '@angular/common';
import { OrdiniMateriePrimeTeamSystemService } from 'src/app/services/ordini-materie-prime-teamsystem.service';

@Component({
  selector: 'tabella-ordini-materie-prime-teamsystem',
  templateUrl: './tabella-ordini-materie-prime-teamsystem.component.html',
  styleUrls: ['./tabella-ordini-materie-prime-teamsystem.component.scss']
})
export class TabellaOrdiniMateriePrimeTeamSystemComponent {
  dataSource: MatTableDataSource<TeamsystemOrdiniMateriePrime>;
  columns = [
    {
      columnDef: 'IdFornitore',
      header: 'Id Fornitore',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.IdFornitore)
    },
    {
      columnDef: 'DataOrdine',
      header: 'Data Ordine',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.DataOrdine)
    },
    {
      columnDef: 'NumeroOrdine',
      header: 'Numero Ordine',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.NumeroOrdine)
    },
    {
      columnDef: 'DataEvasione',
      header: 'Data Evasione',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.DataEvasione)
    },
    {
      columnDef: 'DataPrevConsegna',
      header: 'Data Prev Consegna',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.DataPrevConsegna)
    },
    {
      columnDef: 'PrezzoProdotto',
      header: 'Prezzo Prodotto',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.PrezzoProdotto)
    },
    {
      columnDef: 'QuantitaOrdinata',
      header: 'Quantita Ordinata',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.QuantitaOrdinata)
    },
    {
      columnDef: 'QuantitaConsegnata',
      header: 'Quantita Consegnata',
      cell: (element: TeamsystemOrdiniMateriePrime) =>
        this.nullFormatter(element.QuantitaConsegnata)
    },
    {
      columnDef: 'CostoTotale',
      header: 'Costo Totale',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.CostoTotale)
    },
    {
      columnDef: 'CodiceArticolo',
      header: 'Codice Articolo',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.CodiceArticolo)
    },
    {
      columnDef: 'DescrArticolo',
      header: 'Descr Articolo',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.DescrArticolo)
    },
    {
      columnDef: 'Extracosti',
      header: 'Extra Costi',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.Extracosti)
    },
    {
      columnDef: 'StatoOrdine',
      header: 'Stato Ordine',
      cell: (element: TeamsystemOrdiniMateriePrime) => this.nullFormatter(element.StatoOrdine)
    }
  ];
  displayedColumns = this.columns.map((c) => c.columnDef);
  options: number[] = [];
  selectedValue?: number;

  constructor(
    private materiePrimeService: OrdiniMateriePrimeTeamSystemService,
    private currencyPipe: CurrencyPipe
  ) {
    this.dataSource = new MatTableDataSource();
    this.selectedValue = new Date().getFullYear();

    for (let index = 0; index <= 4; index++) {
      this.options.push(this.selectedValue - index);
    }
    this.dataSource = new MatTableDataSource();
    this.materiePrimeService
      .findAllOrdiniMateriePrime(this.selectedValue)
      .subscribe((materiePrime) => {
        this.dataSource = new MatTableDataSource(materiePrime);
      });
  }
  nullFormatter(value: any) {
    return value ? `${value}` : '-';
  }

  onSelect(value: number) {
    this.selectedValue = value;
    if (this.selectedValue) {
      this.materiePrimeService
        .findAllOrdiniMateriePrime(this.selectedValue)
        .subscribe((materiePrime) => {
          this.dataSource = new MatTableDataSource(materiePrime);
        });
    }
  }
}

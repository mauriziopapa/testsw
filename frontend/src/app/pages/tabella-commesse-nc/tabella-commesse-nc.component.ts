import moment from 'moment';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CommesseNc } from 'src/app/models/commesse-nc';
import { CommesseNcService } from 'src/app/services/commesse-nc.service';

@Component({
    selector: 'tabella-commesse-nc',
    templateUrl: './tabella-commesse-nc.component.html',
    styleUrls: ['./tabella-commesse-nc.component.scss'],
    standalone: false
})
export class TabellaCommesseNcComponent {
  dataSource: MatTableDataSource<CommesseNc>;
  columns = [
    {
      columnDef: 'id',
      header: 'Id',
      cell: (element: CommesseNc) => this.nullFormatter(element.id)
    },
    {
      columnDef: 'AnnoNC',
      header: 'AnnoNC',
      cell: (element: CommesseNc) => this.nullFormatter(element.AnnoNC)
    },
    {
      columnDef: 'NumeroNC',
      header: 'NumeroNC',
      cell: (element: CommesseNc) => this.nullFormatter(element.NumeroNC)
    },
    {
      columnDef: 'Commessa',
      header: 'Commessa',
      cell: (element: CommesseNc) => this.textFormatter(element.Commessa)
    },
    {
      columnDef: 'Data',
      header: 'Data',
      cell: (element: CommesseNc) => this.dateFormatter(element.DataNC)
    },
    {
      columnDef: 'Carica',
      header: 'Carica',
      cell: (element: CommesseNc) => this.nullFormatter(element.Carica)
    },
    {
      columnDef: 'PezziNonConformi',
      header: 'PezziNonConformi',
      cell: (element: CommesseNc) => this.nullFormatter(element.PezziNonConformi)
    },
    {
      columnDef: 'TipoNC',
      header: 'TipoNC',
      cell: (element: CommesseNc) => this.nullFormatter(element.TipoNC)
    },
    {
      columnDef: 'CostoAddebito',
      header: 'Costo Addebito',
      cell: (element: CommesseNc) => this.nullFormatter(element.CostoAddebito)
    },
    {
      columnDef: 'CostoLavorazioni',
      header: 'Costo Lavorazioni',
      cell: (element: CommesseNc) => this.nullFormatter(element.CostoLavorazioni)
    }
  ];

  displayedColumns = this.columns.map((c) => c.columnDef);
  options: number[] = [];
  selectedValue?: number;
  MAX_LENGTH = 140;

  constructor(private commesseNcService: CommesseNcService) {
    this.dataSource = new MatTableDataSource();
    this.selectedValue = new Date().getFullYear();

    for (let index = 0; index <= 4; index++) {
      this.options.push(this.selectedValue - index);
    }
    this.dataSource = new MatTableDataSource();
    this.commesseNcService.findAll(this.selectedValue).subscribe((tasks) => {
      this.dataSource = new MatTableDataSource(tasks);
    });
  }

  nullFormatter(value: any) {
    return value ? `${value}` : '-';
  }

  boolFormatter(value: any) {
    return value == 1 ? 'Si' : 'No';
  }

  textFormatter(input: string): string {
    if (input?.length <= this.MAX_LENGTH) {
      return input;
    }
    return input?.slice(0, this.MAX_LENGTH) + '...';
  }

  dateFormatter(input: string): string {
    if (input) {
      return moment(input).format('DD-MM-YYYY');
    }
    return '';
  }

  onSelect(value: number) {
    this.selectedValue = value;
    if (this.selectedValue) {
      this.commesseNcService.findAll(this.selectedValue).subscribe((tasks) => {
        this.dataSource = new MatTableDataSource(tasks);
      });
    }
  }
}

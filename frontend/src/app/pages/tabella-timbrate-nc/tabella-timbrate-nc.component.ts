import moment from 'moment';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TimbrateNc } from 'src/app/models/timbrate-nc';
import { TimbrateNcService } from 'src/app/services/timbrate-nc.service';

@Component({
    selector: 'tabella-timbrate-nc',
    templateUrl: './tabella-timbrate-nc.component.html',
    styleUrls: ['./tabella-timbrate-nc.component.scss'],
    standalone: false
})
export class TabellaTimbrateNcComponent {
  dataSource: MatTableDataSource<TimbrateNc>;
  columns = [
    {
      columnDef: 'id',
      header: 'Id',
      cell: (element: TimbrateNc) => this.nullFormatter(element.id)
    },
    {
      columnDef: 'AnnoNC',
      header: 'AnnoNC',
      cell: (element: TimbrateNc) => this.nullFormatter(element.AnnoNC)
    },
    {
      columnDef: 'NumeroNC',
      header: 'NumeroNC',
      cell: (element: TimbrateNc) => this.nullFormatter(element.NumeroNC)
    },
    {
      columnDef: 'NumeroCommessa',
      header: 'NumeroCommessa',
      cell: (element: TimbrateNc) => this.textFormatter(element.NumeroCommessa)
    },
    {
      columnDef: 'Data',
      header: 'Data',
      cell: (element: TimbrateNc) => this.dateFormatter(element.DataNC)
    },
    {
      columnDef: 'Carica',
      header: 'Carica',
      cell: (element: TimbrateNc) => this.nullFormatter(element.Carica)
    },
    {
      columnDef: 'Pezzi',
      header: 'Pezzi',
      cell: (element: TimbrateNc) => this.nullFormatter(element.Pezzi)
    },
    {
      columnDef: 'TipoNC',
      header: 'TipoNC',
      cell: (element: TimbrateNc) => this.nullFormatter(element.TipoNC)
    }
  ];

  displayedColumns = this.columns.map((c) => c.columnDef);
  options: number[] = [];
  selectedValue?: number;
  MAX_LENGTH = 140;

  constructor(private timbrateNcService: TimbrateNcService) {
    this.dataSource = new MatTableDataSource();
    this.selectedValue = new Date().getFullYear();

    for (let index = 0; index <= 4; index++) {
      this.options.push(this.selectedValue - index);
    }
    this.dataSource = new MatTableDataSource();
    this.timbrateNcService.findAll(this.selectedValue).subscribe((tasks) => {
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
    if (input.length <= this.MAX_LENGTH) {
      return input;
    }
    return input.slice(0, this.MAX_LENGTH) + '...';
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
      this.timbrateNcService.findAll(this.selectedValue).subscribe((tasks) => {
        this.dataSource = new MatTableDataSource(tasks);
      });
    }
  }
}

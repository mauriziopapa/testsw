import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ZohoTask } from 'src/app/models/zoho-task';
import { ZohoTasksService } from 'src/app/services/zoho-tasks.service';

@Component({
    selector: 'tabella-zoho-tasks',
    templateUrl: './tabella-zoho-tasks.component.html',
    styleUrls: ['./tabella-zoho-tasks.component.scss'],
    standalone: false
})
export class TabellaZohoTasksComponent {
  dataSource: MatTableDataSource<ZohoTask>;
  columns = [
    {
      columnDef: 'key_name',
      header: 'Id Task',
      cell: (element: ZohoTask) => this.nullFormatter(element.key_name)
    },
    {
      columnDef: 'name',
      header: 'Nome',
      cell: (element: ZohoTask) => this.textFormatter(element.name)
    },
    {
      columnDef: 'start_date',
      header: 'Data Inizio',
      cell: (element: ZohoTask) => this.nullFormatter(element.start_date)
    },
    {
      columnDef: 'end_date',
      header: 'Data Fine',
      cell: (element: ZohoTask) => this.nullFormatter(element.end_date)
    },
    {
      columnDef: 'completed',
      header: 'Completato',
      cell: (element: ZohoTask) => this.boolFormatter(element.completed)
    },
    {
      columnDef: 'status_name',
      header: 'Stato',
      cell: (element: ZohoTask) => this.nullFormatter(element.status_name)
    },
    {
      columnDef: 'owners_name',
      header: 'Proprietario',
      cell: (element: ZohoTask) => this.nullFormatter(element.owners_name)
    }
  ];

  displayedColumns = this.columns.map((c) => c.columnDef);
  options: number[] = [];
  selectedValue?: number;
  MAX_LENGTH = 140;

  constructor(private zohoTasksService: ZohoTasksService) {
    this.dataSource = new MatTableDataSource();
    this.selectedValue = new Date().getFullYear();

    for (let index = 0; index <= 4; index++) {
      this.options.push(this.selectedValue - index);
    }
    this.dataSource = new MatTableDataSource();
    this.zohoTasksService.findAll(this.selectedValue).subscribe((tasks) => {
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

  onSelect(value: number) {
    this.selectedValue = value;
    if (this.selectedValue) {
      this.zohoTasksService.findAll(this.selectedValue).subscribe((tasks) => {
        this.dataSource = new MatTableDataSource(tasks);
      });
    }
  }
}

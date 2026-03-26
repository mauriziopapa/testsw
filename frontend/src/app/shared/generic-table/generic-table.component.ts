import { Component, Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'generic-table',
    templateUrl: './generic-table.component.html',
    styleUrls: ['./generic-table.component.scss'],
    standalone: false
})
export class GenericTableComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSourceValues!: MatTableDataSource<any>;

  @Input()
  public set dataSource(value: MatTableDataSource<any>) {
    if (value) {
      this.dataSourceValues = value;
      this.dataSourceValues.sort = this.sort;
      this.dataSourceValues.paginator = this.paginator;
    }
  }

  @Input() displayedColumns: string[];
  @Input() columns: any[];

  constructor() {
    this.displayedColumns = new Array<string>();
    this.columns = new Array<any>();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceValues.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceValues.paginator) {
      this.dataSourceValues.paginator.firstPage();
    }
  }
}

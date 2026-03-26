import { Component, Input, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { KeyValueTable } from 'src/app/models/key-value-table';
import { CommercialeService } from 'src/app/services/commerciale.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
    selector: 'tabella-dati-commerciali',
    templateUrl: './tabella-dati-commerciali.component.html',
    styleUrls: ['./tabella-dati-commerciali.component.scss'],
    standalone: false
})
export class TabellaDatiCommercialiComponent {
  tableName = 'tabella-dati-commerciali';
  displayColumns = ['anno', 'key', 'value'];
  readOnlyCols = new Array<boolean>();

  @Input() tableFilterEvent!: number;

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<KeyValueTable>());
  tableForm: FormGroup = this.fb.group({
    table: this.rows
  });

  tableFilters!: any;

  constructor(
    private fb: FormBuilder,
    private commercialeService: CommercialeService,
    private snackBar: MatSnackBar
  ) {}

  // in order to use only one filter, the parent filter
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableFilterEvent']?.currentValue) {
      const tableFilters = {
        tableYear: changes['tableFilterEvent'].currentValue
      };
      this.tableFilters = tableFilters;
      this.searchByTableFilters(this.tableFilters);
    }
  }

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.emptyTable();
    this.commercialeService.getTable(tableFilters.tableYear).subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addValue(r);
          this.readOnlyCols.push(r.readonly);
        });
        this.updateView();
      }
    });
  }

  save(): void {
    const tableForm = this.tableForm.controls['table'].value;
    const tableData = tableForm.map((table: KeyValueTable) => {
      if (table.value == null) {
        table.value = 0;
      }
      return table;
    });

    this.commercialeService.saveTable(tableData).subscribe({
      next: () => {
        this.searchByTableFilters(this.tableFilters);
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }

  private emptyTable() {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
  }

  private addValue(budget: KeyValueTable) {
    const row = this.fb.group(budget);
    this.rows.push(row);
  }

  private openFailSnackBar() {
    this.snackBar.openFromComponent(FailSnackbarComponent, {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['failUpdated']
    });
  }

  private openSuccessSnackBar() {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      duration: 2000,
      verticalPosition: 'top',
      panelClass: ['successUpdated']
    });
  }

  private updateView() {
    this.dataSource.next(this.rows.controls);
  }
}

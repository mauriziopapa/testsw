import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { LaboratorioTable } from 'src/app/models/laboratorio-table';
import { LaboratorioService } from 'src/app/services/laboratorio.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
    selector: 'tabella-dati-laboratorio',
    templateUrl: './tabella-dati-laboratorio.component.html',
    styleUrls: ['./tabella-dati-laboratorio.component.scss'],
    standalone: false
})
export class TabellaDatiLaboratorioComponent {
  tableName = 'tabella-dati-laboratorio';
  displayColumns = ['anno', 'trimestre', 'costi', 'provini'];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<LaboratorioTable>());
  form: FormGroup = this.fb.group({
    budget: this.rows
  });

  tableFilters!: any;
  modified = false;

  constructor(
    private fb: FormBuilder,
    private labService: LaboratorioService,
    private snackBar: MatSnackBar
  ) {}

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.emptyTable();
    this.labService.findLabData(tableFilters.tableYear).subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addLab(r);
        });
        this.updateView();
      }
    });
  }

  save(): void {
    const budgetForm = this.form.controls['budget'].value;
    const budget = budgetForm.map((budgTable: LaboratorioTable) => {
      if (budgTable.costi == null) {
        budgTable.costi = 0;
      }
      return budgTable;
    });

    this.labService.saveBudget(budget).subscribe({
      next: () => {
        this.searchByTableFilters(this.tableFilters);
        this.openSuccessSnackBar();
        this.modified = false;
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

  private addLab(budget: LaboratorioTable) {
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

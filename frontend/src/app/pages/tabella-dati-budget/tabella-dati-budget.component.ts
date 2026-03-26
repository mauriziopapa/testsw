import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { BudgetTable } from 'src/app/models/budget-table';
import { BudgetService } from 'src/app/services/budget.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
    selector: 'tabella-dati-budget',
    templateUrl: './tabella-dati-budget.component.html',
    styleUrls: ['./tabella-dati-budget.component.scss'],
    standalone: false
})
export class TabellaDatiBudgetComponent {
  tableName = 'tabella-dati-budget';
  displayColumns = ['anno', 'descrizione', 'budget'];
  readOnlyCols = new Array<boolean>();

  anno = new Date().getFullYear();

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<BudgetTable>());
  form: FormGroup = this.fb.group({
    budget: this.rows
  });

  tableFilters!: any;

  constructor(
    private fb: FormBuilder,
    private budget: BudgetService,
    private snackBar: MatSnackBar
  ) {}

  searchByTableFilters(tableFilters: any) {
    this.anno = tableFilters.tableYear;

    this.tableFilters = tableFilters;
    this.emptyTable();
    this.budget.findBudget(tableFilters.tableYear).subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addBudget(r);
          this.readOnlyCols.push(r.readonly);
        });
        this.updateView();
      }
    });
  }

  save(): void {
    const budgetForm = this.form.controls['budget'].value;
    const budget = budgetForm.slice(1, budgetForm.length).map((budgTable: BudgetTable) => {
      if (budgTable.budget == null) {
        budgTable.budget = 0;
      }
      return budgTable;
    });

    this.budget.saveBudget(budget).subscribe({
      next: () => {
        this.searchByTableFilters(this.tableFilters);
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }

  calculateTotal() {
    const budgetForm = this.form.controls['budget'].value;

    const budgets = budgetForm.splice(0, budgetForm.length - 1);
    const total = budgets.reduce(
      (partialSum: number, a: any) => partialSum + (parseFloat(a.budget) || 0),
      0
    );
    budgetForm[0].budget = total;

    this.emptyTable();
    budgets.concat(budgetForm).forEach((r: BudgetTable) => {
      this.addBudget(r);
    });
    this.updateView();
  }

  private emptyTable() {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
  }

  private addBudget(budget: BudgetTable) {
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

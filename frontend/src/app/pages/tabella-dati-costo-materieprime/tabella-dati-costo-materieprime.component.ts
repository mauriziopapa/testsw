import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { CostoMateriaPrima } from 'src/app/models/costo-materiaprima';
import { CostoMateriePrimeService } from 'src/app/services/costo-materieprime.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
    selector: 'tabella-dati-costo-materieprime',
    templateUrl: './tabella-dati-costo-materieprime.component.html',
    styleUrls: ['./tabella-dati-costo-materieprime.component.scss'],
    standalone: false
})
export class TabellaDatiCostoMateriePrimeComponent {
  tableName = 'tabella-dati-costo-materieprime';
  displayColumns = [
    'anno',
    'codice',
    'descrizione',
    'costo_totale',
    'quantita_totale',
    'prezzo_unitario',
    'variazione_anno_precedente'
  ];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<CostoMateriaPrima>());
  form: FormGroup = this.fb.group({
    costoMateriePrime: this.rows
  });

  tableFilters!: any;

  constructor(
    private fb: FormBuilder,
    private costoMateriePrime: CostoMateriePrimeService,
    private snackBar: MatSnackBar
  ) {}

  sortChange(sortState: Sort) {
    if (this.form.get('costoMateriePrime') != null) {
      const values = this.rows.value;
      if (sortState.direction === 'asc' && sortState.active === 'codice') {
        this.sortAscByCodice(values);
      } else if (sortState.direction === 'desc' && sortState.active === 'codice') {
        this.sortDescByCodice(values);
      } else {
        this.sortAscByCodice(values);
      }

      if (sortState.direction === 'asc' && sortState.active === 'anno') {
        this.sortAscByAnno(values);
      } else if (sortState.direction === 'desc' && sortState.active === 'anno') {
        this.sortDescByAnno(values);
      } else {
        this.sortAscByAnno(values);
      }

      this.rows.patchValue(values);
    }
  }

  private sortAscByCodice(values: Array<CostoMateriaPrima>) {
    values.sort((a: CostoMateriaPrima, b: CostoMateriaPrima) => {
      if (a.codice < b.codice) {
        //sort string ascending
        return -1;
      }
      if (a.codice > b.codice) {
        return 1;
      }
      return 0;
    });
  }

  private sortDescByCodice(values: Array<CostoMateriaPrima>) {
    values.sort((a: CostoMateriaPrima, b: CostoMateriaPrima) => {
      if (a.codice < b.codice) {
        return 1;
      }
      if (a.codice > b.codice) {
        return -1;
      }
      return 0;
    });
  }

  private sortAscByAnno(values: Array<CostoMateriaPrima>) {
    values.sort((a: CostoMateriaPrima, b: CostoMateriaPrima) => {
      if (a.anno < b.anno) {
        //sort string ascending
        return -1;
      }
      if (a.anno > b.anno) {
        return 1;
      }
      return 0;
    });
  }

  private sortDescByAnno(values: Array<CostoMateriaPrima>) {
    values.sort((a: CostoMateriaPrima, b: CostoMateriaPrima) => {
      if (a.anno < b.anno) {
        return 1;
      }
      if (a.anno > b.anno) {
        return -1;
      }
      return 0;
    });
  }

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.emptyTable();
    this.costoMateriePrime.findAllCostiMateriePrime(tableFilters.tableYear).subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addMateriaPrima(r);
        });
        this.updateView();
      }
    });
  }

  addRow() {
    const row = this.fb.group(new CostoMateriaPrima());
    this.rows.push(row);
    this.updateView();
  }

  save(): void {
    const costiForm = this.form.controls['costoMateriePrime'].value;
    const costi = costiForm.map((contatore: CostoMateriaPrima) => {
      return contatore;
    });

    this.costoMateriePrime.saveCostiMateriePrime(costi).subscribe({
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

  private addMateriaPrima(contatore: CostoMateriaPrima) {
    const row = this.fb.group(contatore);
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

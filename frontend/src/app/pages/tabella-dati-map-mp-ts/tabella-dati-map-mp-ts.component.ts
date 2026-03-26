import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';
import { MateriaPrima } from 'src/app/models/materiaprima';
import { MateriaPrimaMappingTS } from 'src/app/models/materiaprima-mapping';
import { MateriaPrimaTS } from 'src/app/models/materiaprima-ts';
import { MateriePrimeService } from 'src/app/services/materie-prime.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
    selector: 'tabella-dati-map-mp-ts',
    templateUrl: './tabella-dati-map-mp-ts.component.html',
    styleUrls: ['./tabella-dati-map-mp-ts.component.scss'],
    standalone: false
})
export class TabellaDatiMapMpTSComponent {
  tableName = 'tabella-dati-map-mp-ts';

  displayedColumns = [
    'materia_prima',
    'materia_prima_ts',
    'materia_prima_ts_cod',
    'fornitore_materia_prima_ts_cod',
    'azioni'
  ];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<MateriaPrimaMappingTS>());
  form: FormGroup = this.fb.group({
    materie_prime: this.rows
  });

  tableFilters!: any;

  optionsPunti = new Array<MateriaPrima>();
  filteredOptions: Observable<MateriaPrima[]>[] = [];

  optionsInquinanti = new Array<MateriaPrimaTS>();
  filteredInquinanti: Observable<MateriaPrimaTS[]>[] = [];

  constructor(
    private fb: FormBuilder,
    private materiePrimeService: MateriePrimeService,
    private snackBar: MatSnackBar
  ) {
    this.materiePrimeService.findAllMateriePrime().subscribe({
      next: (mp) => {
        this.optionsPunti = mp;
      }
    });
    this.materiePrimeService.findAllMateriePrimeTS().subscribe({
      next: (mp) => {
        this.optionsInquinanti = mp;
      }
    });

    this.search();
  }

  search() {
    this.emptyTable();
    this.materiePrimeService.findAllMapping().subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addMateriaPrima(r);
          this.manageNameControlPde(index);
          this.manageNameControlInq(index);
        });
        this.updateView();
      }
    });
  }

  addRow() {
    const row = this.fb.group(new MateriaPrimaMappingTS());
    row.get('data')?.patchValue(new Date());
    this.rows.push(row);
    const controls = <FormArray>this.form.controls['materie_prime'];
    this.manageNameControlPde(controls.length - 1);
    this.manageNameControlInq(controls.length - 1);
    this.updateView();
  }

  deleteRow(event: any, index: any): void {
    const id = this.rows.at(index).value.id;
    if (id) {
      this.materiePrimeService.deleteMapping(id).subscribe({
        next: () => {
          this.openSuccessSnackBar();
          this.rows.removeAt(index);
          this.updateView();
        },
        error: (err) => {
          this.openFailSnackBar();
        }
      });
    } else {
      this.rows.removeAt(index);
      this.updateView();
    }
  }

  save(): void {
    const mpForm = this.form.controls['materie_prime'].value;
    const materiePrime = mpForm.map((mp: MateriaPrimaMappingTS) => ({
      id: mp.id,
      data: mp.data,
      id_materiaprima: mp.materia_prima_id,
      id_materiaprima_ts: mp.materia_prima_ts_id
    }));

    this.materiePrimeService.saveMapping(materiePrime).subscribe({
      next: () => {
        this.search();
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

  mpChange(option: any, element: any) {
    const index = this.rows.controls.findIndex((x) => {
      if (element.value.id === 0) {
        // riga appena creata
        return (
          x.value.id === element.value.id &&
          x.value.data === element.value.data &&
          x.value.materia_prima === option.nome
        );
      }
      return (
        x.value.id === element.value.id &&
        x.value.materia_prima_id === element.value.materia_prima_id &&
        x.value.materia_prima === option.nome
      );
    });

    element.value.materia_prima_id = option.id;
    (<FormArray>this.form.controls['materie_prime'])
      .at(index)
      .get('materia_prima_id')
      ?.patchValue(option.id);
  }

  mptsChange(option: any, element: any) {
    const index = this.rows.controls.findIndex((x) => {
      if (element.value.id === 0) {
        // riga appena creata
        return (
          x.value.id === element.value.id &&
          x.value.data === element.value.data &&
          x.value.materia_prima_id === element.value.materia_prima_id &&
          x.value.materia_prima === element.value.materia_prima &&
          x.value.materia_prima_ts === option.DesArticolo
        );
      }
      return (
        x.value.id === element.value.id &&
        x.value.materia_prima_id === element.value.materia_prima_id &&
        x.value.materia_prima === element.value.materia_prima &&
        x.value.materia_prima_ts_id === element.value.materia_prima_ts_id
      );
    });

    element.value.materia_prima_ts_id = option.id;
    (<FormArray>this.form.controls['materie_prime'])
      .at(index)
      .get('materia_prima_ts_id')
      ?.patchValue(option.id);

    element.value.materia_prima_ts_id = option.id;
    (<FormArray>this.form.controls['materie_prime'])
      .at(index)
      .get('materia_prima_ts_cod')
      ?.patchValue(option.CodArticolo.trim());

    element.value.fornitore_materia_prima_ts_cod = option.id;
    (<FormArray>this.form.controls['materie_prime'])
      .at(index)
      .get('fornitore_materia_prima_ts_cod')
      ?.patchValue(option.CodFornitore);
  }

  private manageNameControlPde(index: number) {
    const arrayControl = this.form.get('materie_prime') as FormArray;
    this.filteredOptions[index] = arrayControl
      .at(index)
      .get('materia_prima')!
      .valueChanges.pipe(
        startWith<string | MateriaPrima>(''),
        map((value) => (typeof value === 'string' ? value : value.nome)),
        map((name) => (name ? this._filterPunti(name) : this.optionsPunti.slice()))
      );
  }

  private manageNameControlInq(index: number) {
    const arrayControl = this.form.get('materie_prime') as FormArray;
    this.filteredInquinanti[index] = arrayControl
      .at(index)
      .get('materia_prima_ts')!
      .valueChanges.pipe(
        startWith<string | MateriaPrimaTS>(''),
        map((value) => (typeof value === 'string' ? value : value.DesArticolo)),
        map((name) => (name ? this._filterInquinante(name) : this.optionsInquinanti.slice()))
      );
  }

  private addMateriaPrima(mp: MateriaPrimaMappingTS) {
    const row = this.fb.group(mp);
    this.rows.push(row);
  }

  private _filterPunti(value: string): MateriaPrima[] {
    const filterValue = value.toLowerCase();
    return this.optionsPunti.filter((option) => option.nome.toLowerCase().includes(filterValue));
  }

  private _filterInquinante(value: string): MateriaPrimaTS[] {
    const filterValue = value.toLowerCase();
    return this.optionsInquinanti.filter((option) =>
      option.DesArticolo.toLowerCase().includes(filterValue)
    );
  }

  private updateView() {
    this.dataSource.next(this.rows.controls);
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
}

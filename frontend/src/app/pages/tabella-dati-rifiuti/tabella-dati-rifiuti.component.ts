import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';
import { Rifiuto } from 'src/app/models/rifiuto';
import { RifiutoProdotto } from 'src/app/models/rifiuto-prodotto';
import { RifiutiService } from 'src/app/services/rifiuti.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
    selector: 'tabella-dati-rifiuti',
    templateUrl: './tabella-dati-rifiuti.component.html',
    styleUrls: ['./tabella-dati-rifiuti.component.scss'],
    standalone: false
})
export class TabellaDatiRifiutiComponent {
  tableName = 'tabella-rifiuti';
  displayColumns = ['data', 'nome_rifiuto', 'quantita', 'udm', 'azioni'];

  optionsRifiuti = new Array<Rifiuto>();
  filteredOptions: Observable<Rifiuto[]>[] = [];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<RifiutoProdotto>());
  form: FormGroup = this.fb.group({
    rifiuti: this.rows
  });

  tableFilters!: any;

  constructor(
    private fb: FormBuilder,
    private rifiutiService: RifiutiService,
    private snackBar: MatSnackBar
  ) {
    this.rifiutiService.getRifiuti().subscribe({
      next: (rifiuti) => {
        this.optionsRifiuti = rifiuti;
      }
    });
  }

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.emptyTable();
    this.rifiutiService.findAllRifiutiProdotti(tableFilters.tableYear).subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addRifiuto(r);
          this.manageNameControl(index);
        });
        this.updateView();
      }
    });
  }

  addRow() {
    const row = this.fb.group(new RifiutoProdotto());
    this.rows.push(row);
    const controls = <FormArray>this.form.controls['rifiuti'];
    this.manageNameControl(controls.length - 1);
    this.updateView();
  }

  deleteRow(event: any, index: any): void {
    const id = this.rows.at(index).value.id;

    if (id) {
      this.rifiutiService.deleteRifiuti(id).subscribe({
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
    const rifiutiForm = this.form.controls['rifiuti'].value;
    // per popolare l'id
    const rifiutiProdotti = rifiutiForm.map((rifiuto: RifiutoProdotto) => {
      if (rifiuto.id_rifiuto === 0) {
        const selectedGarbage = this.optionsRifiuti.find(
          (rif) => rif.nome === rifiuto.nome_rifiuto
        );
        rifiuto.id_rifiuto = selectedGarbage!.id;
      }
      return rifiuto;
    });

    this.rifiutiService.saveRifiuti(rifiutiProdotti).subscribe({
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

  private manageNameControl(index: number) {
    const arrayControl = this.form.get('rifiuti') as FormArray;
    this.filteredOptions[index] = arrayControl
      .at(index)
      .get('nome_rifiuto')!
      .valueChanges.pipe(
        startWith<string | Rifiuto>(''),
        map((value) => (typeof value === 'string' ? value : value.nome)),
        map((name) => (name ? this._filter(name) : this.optionsRifiuti.slice()))
      );
  }

  private addRifiuto(rifiuto: RifiutoProdotto) {
    rifiuto.udm = rifiuto.rifiutis[0].udm;
    const row = this.fb.group(rifiuto);
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

  private _filter(value: string): Rifiuto[] {
    const filterValue = value.toLowerCase();
    return this.optionsRifiuti.filter((option) => option.nome.toLowerCase().includes(filterValue));
  }

  private updateView() {
    this.dataSource.next(this.rows.controls);
  }
}

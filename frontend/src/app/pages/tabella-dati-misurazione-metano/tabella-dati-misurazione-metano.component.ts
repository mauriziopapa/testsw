import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';
import { ContatoreMetano } from 'src/app/models/contatore-metano';
import { ContatoreMisurazioneMetano } from 'src/app/models/contatore-misurazione-metano';
import { MetanoService } from 'src/app/services/metano.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
    selector: 'tabella-dati-misurazione-metano',
    templateUrl: './tabella-dati-misurazione-metano.component.html',
    styleUrls: ['./tabella-dati-misurazione-metano.component.scss'],
    standalone: false
})
export class TabellaDatiMisurazioneMetanoComponent {
  tableName = 'tabella-dati-misurazione-metano';
  displayColumns = ['data', 'nome_contatore', 'misurazione', 'udm', 'azioni'];

  optionsContatori = new Array<ContatoreMetano>();
  filteredOptions: Observable<ContatoreMetano[]>[] = [];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<ContatoreMisurazioneMetano>());
  form: FormGroup = this.fb.group({
    misurazioniMetano: this.rows
  });

  tableFilters!: any;

  constructor(
    private fb: FormBuilder,
    private metanoService: MetanoService,
    private snackBar: MatSnackBar
  ) {
    this.metanoService.getContatori().subscribe({
      next: (contatori) => {
        this.optionsContatori = contatori;
      }
    });
  }

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.emptyTable();
    this.metanoService.findAllContatoriMisurazioni(tableFilters.tableYear).subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addContatore(r);
          this.manageNameControl(index);
        });
        this.updateView();
      }
    });
  }

  addRow() {
    const row = this.fb.group(new ContatoreMisurazioneMetano());
    this.rows.push(row);
    const controls = <FormArray>this.form.controls['misurazioniMetano'];
    this.manageNameControl(controls.length - 1);
    this.updateView();
  }

  deleteRow(event: any, index: any): void {
    const id = this.rows.at(index).value.id;

    if (id) {
      this.metanoService.deleteMisurazione(id).subscribe({
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
    const misurazioniMetanoForm = this.form.controls['misurazioniMetano'].value;
    const misurazioniMetano = misurazioniMetanoForm.map((contatore: ContatoreMisurazioneMetano) => {
      const selected = this.optionsContatori.find((rif) => rif.nome === contatore.nome_contatore);
      contatore.id_contatore = selected!.id;
      return contatore;
    });

    this.metanoService.saveContatoriMisurazioni(misurazioniMetano).subscribe({
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
    const arrayControl = this.form.get('misurazioniMetano') as FormArray;
    this.filteredOptions[index] = arrayControl
      .at(index)
      .get('nome_contatore')!
      .valueChanges.pipe(
        startWith<string | ContatoreMetano>(''),
        map((value) => (typeof value === 'string' ? value : value.nome)),
        map((name) => (name ? this._filter(name) : this.optionsContatori.slice()))
      );
  }

  private addContatore(contatore: ContatoreMisurazioneMetano) {
    contatore.udm = contatore.contatori_metanos[0].udm;
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

  private _filter(value: string): ContatoreMetano[] {
    const filterValue = value.toLowerCase();
    return this.optionsContatori.filter((option) =>
      option.nome.toLowerCase().includes(filterValue)
    );
  }

  private updateView() {
    this.dataSource.next(this.rows.controls);
  }
}

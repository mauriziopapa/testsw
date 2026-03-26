import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';
import { Emissione } from 'src/app/models/emissione';
import { Inquinante } from 'src/app/models/inquinante';
import { LimitiEmissione } from 'src/app/models/limiti-emissione';
import { EmissioniService } from 'src/app/services/emissioni.service';
import { LimitiEmissioneService } from 'src/app/services/limiti-emissione.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
  selector: 'tabella-dati-emissioni',
  templateUrl: './tabella-dati-emissioni.component.html',
  styleUrls: ['./tabella-dati-emissioni.component.scss']
})
export class TabellaDatiEmissioniComponent {
  tableName = 'tabella-dati-emissioni';

  displayedColumns = [
    'Data',
    'punto_di_emissione',
    'rapporto',
    'inquinante',
    'c_rilevata',
    'limiti_di_legge',
    'azioni'
  ];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<Emissione>());
  form: FormGroup = this.fb.group({
    emissioni: this.rows
  });

  tableFilters!: any;

  optionsPunti = new Array<LimitiEmissione>();
  filteredOptions: Observable<LimitiEmissione[]>[] = [];

  optionsInquinanti = new Array<Inquinante>();
  filteredInquinanti: Observable<Inquinante[]>[] = [];

  constructor(
    private fb: FormBuilder,
    private emissioniService: EmissioniService,
    private limitiEmissioniService: LimitiEmissioneService,
    private snackBar: MatSnackBar
  ) {
    this.limitiEmissioniService.getLimitiEmissione().subscribe({
      next: (punti) => {
        this.optionsPunti = punti;
      }
    });
  }

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.emptyTable();

    this.emissioniService.findAll(tableFilters.tableYear, tableFilters.tableMonth).subscribe({
      next: (response) => {
        response.forEach((r, index) => {
          this.addEmissione(r);
          this.manageNameControlPde(index);
          this.manageNameControlInq(index);
        });
        this.updateView();
      }
    });
  }

  addRow() {
    const row = this.fb.group(new Emissione());
    this.rows.push(row);
    const controls = <FormArray>this.form.controls['emissioni'];
    this.manageNameControlPde(controls.length - 1);
    this.manageNameControlInq(controls.length - 1);
    this.updateView();
  }

  deleteRow(event: any, index: any): void {
    const id = this.rows.at(index).value.id;
    if (id) {
      this.emissioniService.deleteEmissione(id).subscribe({
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
    const emissioniForm = this.form.controls['emissioni'].value;
    const emissioni = emissioniForm.map((emissione: Emissione) => {
      const selected = this.optionsPunti.find(
        (rif) => rif.punto_di_emissione === emissione.punto_di_emissione
      );
      if (selected) {
        emissione.id_punto_di_emissione = selected.id_punto_di_emissione;
      }
      const selectedInq = this.optionsPunti
        .flatMap((punto) => punto.inquinanti)
        .find(
          (rif) => rif.nome === emissione.inquinante && rif.limite === emissione.limiti_di_legge
        );
      if (selectedInq) {
        emissione.id_inquinante = selectedInq.id;
      }
      return emissione;
    });

    this.emissioniService.saveEmissioni(emissioni).subscribe({
      next: () => {
        this.searchByTableFilters(this.tableFilters);
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }

  pdeChange(option: any, element: any) {
    // da gestire il caso in cui la option vuota che quindi senza valore selezionato
    this.optionsInquinanti = option.inquinanti;

    const index = this.rows.controls.findIndex((x) => {
      if (element.value.id === 0) {
        // riga appena creata
        return (
          x.value.id === element.value.id &&
          x.value.data === element.value.data &&
          x.value.id_punto_di_emissione === element.value.id_punto_di_emissione &&
          x.value.punto_di_emissione === option.punto_di_emissione
        );
      }
      return (
        x.value.id === element.value.id &&
        x.value.id_punto_di_emissione === element.value.id_punto_di_emissione
      );
    });

    (<FormArray>this.form.controls['emissioni']).at(index).get('inquinante')?.patchValue('');
    (<FormArray>this.form.controls['emissioni']).at(index).get('limiti_di_legge')?.patchValue(0);
    (<FormArray>this.form.controls['emissioni']).at(index).get('c_rilevata')?.patchValue(0);
    this.manageNameControlInq(index);
  }

  inquinanteChange(option: any, element: any) {
    // da gestire il caso in cui la option vuota che quindi senza valore selezionato
    const index = this.rows.controls.findIndex((x) => {
      if (element.value.id === 0) {
        // riga appena creata
        return (
          x.value.id === element.value.id &&
          x.value.data === element.value.data &&
          x.value.id_punto_di_emissione === element.value.id_punto_di_emissione &&
          x.value.inquinante === option.nome
        );
      }
      return (
        x.value.id === element.value.id &&
        x.value.id_punto_di_emissione === element.value.id_punto_di_emissione
      );
    });
    (<FormArray>this.form.controls['emissioni'])
      .at(index)
      .get('limiti_di_legge')
      ?.patchValue(option.limite);
  }

  resetInquinanti(element: any) {
    const limiti = this.optionsPunti.filter(
      (opt: LimitiEmissione) => opt.punto_di_emissione === element.value.punto_di_emissione
    )[0];
    this.optionsInquinanti = limiti.inquinanti;
  }

  private emptyTable() {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
  }

  private manageNameControlPde(index: number) {
    const arrayControl = this.form.get('emissioni') as FormArray;
    this.filteredOptions[index] = arrayControl
      .at(index)
      .get('punto_di_emissione')!
      .valueChanges.pipe(
        startWith<string | LimitiEmissione>(''),
        map((value) => (typeof value === 'string' ? value : value.punto_di_emissione)),
        map((name) => (name ? this._filterPunti(name) : this.optionsPunti.slice()))
      );
  }

  private manageNameControlInq(index: number) {
    const arrayControl = this.form.get('emissioni') as FormArray;
    this.filteredInquinanti[index] = arrayControl
      .at(index)
      .get('inquinante')!
      .valueChanges.pipe(
        startWith<string | Inquinante>(''),
        map((value) => (typeof value === 'string' ? value : value.nome)),
        map((name) => (name ? this._filterInquinante(name) : this.optionsInquinanti.slice()))
      );
  }

  private addEmissione(emissione: Emissione) {
    const row = this.fb.group(emissione);
    this.rows.push(row);
  }

  private _filterPunti(value: string): LimitiEmissione[] {
    const filterValue = value.toLowerCase();
    return this.optionsPunti.filter((option) =>
      option.punto_di_emissione.toLowerCase().includes(filterValue)
    );
  }

  private _filterInquinante(value: string): Inquinante[] {
    const filterValue = value.toLowerCase();
    return this.optionsInquinanti.filter((option) =>
      option.nome.toLowerCase().includes(filterValue)
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

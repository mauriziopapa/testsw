import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';
import { Contatore } from 'src/app/models/contatore';
import { ContatoreMisurazione } from 'src/app/models/contatore-misurazione';
import { ContatoriService } from 'src/app/services/contatori.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
  selector: 'tabella-dati-contatori-misurazioni',
  templateUrl: './tabella-dati-contatori-misurazioni.component.html',
  styleUrls: ['./tabella-dati-contatori-misurazioni.component.scss']
})
export class TabellaDatiContatoriMisurazioniComponent {
  tableName = 'tabella-dati-contatori-misurazioni';
  displayColumns = ['data', 'nome_contatore', 'misurazione', 'udm', 'azioni'];

  optionsContatori = new Array<Contatore>();
  filteredOptions: Observable<Contatore[]>[] = [];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array(new Array<ContatoreMisurazione>());
  form: FormGroup = this.fb.group({
    contatoriMisurazioni: this.rows
  });

  tableFilters!: any;

  constructor(
    private fb: FormBuilder,
    private contatoriService: ContatoriService,
    private snackBar: MatSnackBar
  ) {
    this.contatoriService.getContatori().subscribe({
      next: (contatori) => {
        this.optionsContatori = contatori;
      }
    });
  }

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.emptyTable();
    this.contatoriService.findAllContatoriMisurazioni(tableFilters.tableYear).subscribe({
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
    const row = this.fb.group(new ContatoreMisurazione());
    this.rows.push(row);
    const controls = <FormArray>this.form.controls['contatoriMisurazioni'];
    this.manageNameControl(controls.length - 1);
    this.updateView();
  }

  deleteRow(event: any, index: any): void {
    const id = this.rows.at(index).value.id;

    if (id) {
      this.contatoriService.deleteMisurazione(id).subscribe({
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
    const contatoriMisurazioniForm = this.form.controls['contatoriMisurazioni'].value;
    const contatoriMisurazioni = contatoriMisurazioniForm.map((contatore: ContatoreMisurazione) => {
      const selected = this.optionsContatori.find((rif) => rif.nome === contatore.nome_contatore);
      contatore.id_contatore = selected!.id;
      return contatore;
    });

    this.contatoriService.saveContatoriMisurazioni(contatoriMisurazioni).subscribe({
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
    const arrayControl = this.form.get('contatoriMisurazioni') as FormArray;
    this.filteredOptions[index] = arrayControl
      .at(index)
      .get('nome_contatore')!
      .valueChanges.pipe(
        startWith<string | Contatore>(''),
        map((value) => (typeof value === 'string' ? value : value.nome)),
        map((name) => (name ? this._filter(name) : this.optionsContatori.slice()))
      );
  }

  private addContatore(contatore: ContatoreMisurazione) {
    contatore.udm = contatore.contatoris[0].udm;
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

  private _filter(value: string): Contatore[] {
    const filterValue = value.toLowerCase();
    return this.optionsContatori.filter((option) =>
      option.nome.toLowerCase().includes(filterValue)
    );
  }

  private updateView() {
    this.dataSource.next(this.rows.controls);
  }
}

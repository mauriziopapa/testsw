import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { Typology } from '../../models/typology';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
import { FiltersService } from 'src/app/services/filters.service';
import { FilterValues } from 'src/app/models/filter-values';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY'
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'kpi-filters',
  templateUrl: './kpi-filters.component.html',
  styleUrls: ['./kpi-filters.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class KpiFiltersComponent implements OnInit {
  @Input() widgetInstance = 0;
  @Input() url = '';
  @Input() globalFilters: any;
  @Output() filtersChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<any>();

  form: FormGroup;

  from: FormControl;
  to: FormControl;

  filters: FilterValues[] = [];

  typologies: Typology[] = [];
  tipology: FormControl;

  targets: Typology[] = [];
  target: FormControl;

  years: Typology[] = [];
  year: FormControl;

  yearFrom: FormControl;
  yearTo: FormControl;

  reparti: Typology[] = [];
  reparto: FormControl;

  pdes: Typology[] = [];
  pde: FormControl;

  zones: Typology[] = [];
  zone: FormControl;

  clients: Typology[] = [];
  client: FormControl;

  pieces: Typology[] = [];
  piece: FormControl;

  operators: Typology[] = [];
  operator: FormControl;

  materials: Typology[] = [];
  material: FormControl;

  suppliers: Typology[] = [];
  supplier: FormControl;

  risks: Typology[] = [];
  risk: FormControl;

  offers: Typology[] = [];
  offer: FormControl;

  macroareas: Typology[] = [];
  macroarea: FormControl;

  constructor(private fb: FormBuilder, private filtersService: FiltersService) {
    this.target = new FormControl();
    this.year = new FormControl();
    this.yearFrom = new FormControl();
    this.yearTo = new FormControl();
    this.tipology = new FormControl();
    this.zone = new FormControl();
    this.reparto = new FormControl();
    this.pde = new FormControl();
    this.client = new FormControl();
    this.piece = new FormControl();
    this.operator = new FormControl();
    this.material = new FormControl();
    this.supplier = new FormControl();
    this.risk = new FormControl();
    this.offer = new FormControl();
    this.macroarea = new FormControl();
    this.from = new FormControl(moment());
    this.to = new FormControl(moment());

    let currentYear = new Date().getFullYear();
    for (let i = 2008; i <= currentYear + 1; i++) {
      this.years.push({ value: i.toString(), viewValue: i.toString() });
    }

    this.form = this.fb.group({
      from: this.from,
      to: this.to,
      year: this.year,
      yearFrom: this.yearFrom,
      yearTo: this.yearTo,
      target: this.target,
      reparto: this.reparto,
      pde: this.pde,
      zone: this.zone,
      client: this.client,
      piece: this.piece,
      operator: this.operator,
      tipology: this.tipology,
      material: this.material,
      supplier: this.supplier,
      risk: this.risk,
      offer: this.offer,
      macroarea: this.macroarea
    });
  }

  ngOnInit(): void {
    this.filtersService.getKpiFilters(this.widgetInstance).subscribe({
      next: (response) => {
        this.filters = response;

        this.filters.forEach((filter: FilterValues) => {
          if (filter.type === 'monthpicker' && filter.name === 'dal_month') {
            const def_value = moment(filter.default_value, 'MM-YYYY');
            this.from.setValue(def_value);
          }

          if (filter.type === 'monthpicker' && filter.name === 'al_month') {
            const def_value = moment(filter.default_value, 'MM-YYYY');
            this.to.setValue(def_value);
          }

          if (filter.type === 'combo' && filter.name !== 'target') {
            let split = filter.option_list.split(';');
            split.forEach((val: string) => {
              let options = val.split(':');
              this.typologies.push({ value: options[0], viewValue: options[1] });
              this.tipology.setValue(filter.default_value);
            });
          }

          if (filter.type === 'combo' && filter.name === 'target') {
            let split = filter.option_list.split(';');
            split.forEach((val: string) => {
              let options = val.split(':');
              this.targets.push({ value: options[0], viewValue: options[1] });
              this.target.setValue(filter.default_value);
            });
          }

          if (filter.type === 'autocomplete' && filter.lbl === 'Anno:') {
            this.year.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'dal_anno_ts') {
            this.yearFrom.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'al_anno_ts') {
            this.yearTo.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'reparto_ts') {
            this.filtersService
              .getFilterValuesWithTime(
                this.url,
                filter.name,
                this.from.value.format('YYYY-MM'),
                this.to.value.format('YYYY-MM')
              )
              .subscribe({
                next: (value) => {
                  this.reparti = value.map((v) => {
                    return { value: v.reparto, viewValue: v.reparto };
                  });
                }
              });
            this.reparto.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'pde_ts') {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.pdes = value.map((v) => {
                  return { value: v.id, viewValue: v.pde };
                });
              }
            });
            this.pde.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'zone_trasporti_ts') {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.zones = value.map((v) => {
                  return { value: v.zona, viewValue: v.zona };
                });
              }
            });
            this.zone.setValue(filter.default_value);
          }

          if (
            filter.type === 'autocomplete' &&
            ['clienti_ts', 'clienti_ind_ts', 'clienti_ts_un'].includes(filter.name)
          ) {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.clients = value.map((v) => {
                  return { value: v.codice_anagrafica, viewValue: v.rag_sociale };
                });
              }
            });
            this.client.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'pezzi_ind_ts') {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.pieces = value.map((v) => {
                  return { value: v.id_prodotto, viewValue: v.codice };
                });
              }
            });
            this.piece.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'operatori_ind_ts') {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.operators = value.map((v) => {
                  return { value: v.id_operatore, viewValue: v.nome_operatore };
                });
              }
            });
            this.operator.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'materie_prime_ts') {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.materials = value.map((v) => {
                  return { value: v.id_materia_prima, viewValue: v.nome_materia_prima };
                });
              }
            });
            this.material.setValue(filter.default_value);
          }

          if (
            filter.type === 'autocomplete' &&
            ['fornitori_ts', 'fornitori_mp_ts', 'fornitori_con_ordini_ts'].includes(filter.name)
          ) {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.suppliers = value.map((v) => {
                  return { value: v.id_fornitore, viewValue: v.nome_fornitore };
                });
              }
            });
            this.supplier.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && ['rischio_ts'].includes(filter.name)) {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.risks = value.map((v) => {
                  return { value: v.id_rischio, viewValue: v.nome_rischio };
                });
              }
            });
            this.risk.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'tipi_offerte_ts') {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.offers = value.map((v) => {
                  return { value: v.tipo_offerta, viewValue: v.tipo_offerta };
                });
              }
            });
            this.offer.setValue(filter.default_value);
          }

          if (filter.type === 'autocomplete' && filter.name === 'macroaree_ts') {
            this.filtersService.getFilterValues(this.url, filter.name).subscribe({
              next: (value) => {
                this.macroareas = value.map((v) => {
                  return { value: v.id, viewValue: v.macroarea };
                });
              }
            });
            this.macroarea.setValue(filter.default_value);
          }
        });

        this.search.emit(this.form.value);
        this.form.valueChanges.subscribe((value) => {
          const event = { formValues: this.form.value, filterValues: this.filters };
          this.filtersChange.emit(event);
        });
      }
    });
  }

  chosenYearFromHandler(normalizedYear: Moment) {
    const ctrlValue = this.from.value;
    ctrlValue?.year(normalizedYear.year());
    this.from.setValue(ctrlValue);
  }

  chosenMonthFromHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.from.value;
    ctrlValue?.month(normalizedMonth.month());
    this.from.setValue(ctrlValue);
    datepicker.close();
  }

  chosenYearToHandler(normalizedYear: Moment) {
    const ctrlValue = this.to.value;
    ctrlValue?.year(normalizedYear.year());
    this.to.setValue(ctrlValue);
  }

  chosenMonthToHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.to.value;
    ctrlValue?.month(normalizedMonth.month());
    this.to.setValue(ctrlValue);
    datepicker.close();
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "globalFilters" changed
    // and only updates the UI. It is updated by abstract-dashboard component.
    if (changes['globalFilters'] && changes['globalFilters'].currentValue) {
      let filters = changes['globalFilters'].currentValue;
      let value = moment(filters.to, 'MM-YYYY');
      this.to.setValue(value);

      value = moment(filters.from, 'MM-YYYY');
      this.from.setValue(value);

      this.year.setValue(filters.year);
      this.zone.setValue(filters.zone);

      this.yearFrom.setValue(filters.yearFrom);
      this.yearTo.setValue(filters.yearTo);

      this.updateReparti();
    }
  }

  clientSelectionChange(event: any) {
    this.filtersService.getFilterValuesCombo(this.url, 'pezzi_ind_ts', event.value).subscribe({
      next: (value) => {
        this.pieces = value.map((v) => {
          return { value: v.id_prodotto, viewValue: v.codice };
        });
      }
    });
  }

  riskSelectionChange(event: any) {
    if (this.url === 'costo_materie_prime_ts') {
      this.filtersService
        .getFilterValuesCombo(this.url, 'materie_prime_ts', event.value)
        .subscribe({
          next: (value) => {
            this.materials = value.map((v) => {
              return { value: v.id_materia_prima, viewValue: v.nome_materia_prima };
            });
          }
        });
    } else {
      this.filtersService
        .getFilterValuesCombo(this.url, 'fornitori_con_ordini_ts', event.value)
        .subscribe({
          next: (value) => {
            this.suppliers = value.map((v) => {
              return { value: v.id_fornitore, viewValue: v.nome_fornitore };
            });
          }
        });
    }
  }

  updateReparti(): void {
    if (this.reparto.value != null && this.reparto.value != '') {
      this.filtersService
        .getFilterValuesWithTime(
          this.url,
          'reparto_ts',
          this.from.value.format('YYYY-MM'),
          this.to.value.format('YYYY-MM')
        )
        .subscribe({
          next: (value) => {
            this.reparti = value.map((v) => {
              return { value: v.reparto, viewValue: v.reparto };
            });
            this.reparto.setValue(this.reparti[0].viewValue);
          }
        });
    }
  }

  onSubmit() {
    this.search.emit(this.form.value);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Typology } from '../../models/typology';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';

@Component({
    selector: 'table-filters',
    templateUrl: './table-filters.component.html',
    styleUrls: ['./table-filters.component.scss'],
    providers: [],
    standalone: false
})
export class TableFiltersComponent implements OnInit {
  //accordion
  panelOpenState = true;

  @Input() tableName!: string;
  @Output() tableSearch = new EventEmitter<any>();

  tableFiltersForm: FormGroup;

  tableFilters: any;

  tableYears: Typology[] = [];
  tableYear: FormControl;

  tableReparti: Typology[] = [];
  tableReparto: FormControl;

  tableMonths: Typology[] = [];
  tableMonth: FormControl;

  tableYearFrom: FormControl;
  tableYearTo: FormControl;

  maintenanceTypes: Typology[] = [];
  maintenanceType: FormControl;

  constructor(private fb: FormBuilder) {
    this.tableYear = new FormControl();
    this.tableReparto = new FormControl();
    this.tableMonth = new FormControl();
    this.tableYearFrom = new FormControl();
    this.tableYearTo = new FormControl();
    this.maintenanceType = new FormControl();

    const currentYear = new Date().getFullYear();
    for (let i = 2019; i <= currentYear + 1; i++) {
      this.tableYears.push({ value: i.toString(), viewValue: i.toString() });
    }

    for (let i = 1; i <= 12; i++) {
      this.tableMonths.push({ value: i.toString(), viewValue: i.toString() });
    }

    this.tableReparti.push(
      { value: 'LLF', viewValue: 'LLF' },
      { value: 'NCV', viewValue: 'NCV' },
      { value: 'NCV Cieffe', viewValue: 'NCV Cieffe' },
      { value: 'NCV Ipsen', viewValue: 'NCV Ipsen' },
      { value: 'VUOTO', viewValue: 'VUOTO' },
      { value: 'IND', viewValue: 'IND' },
      { value: 'TV', viewValue: 'TV' }
    );

    this.maintenanceTypes.push(
      { value: 'predittiva', viewValue: 'Predittiva' },
      { value: 'programmata', viewValue: 'Programmata' }
    );

    this.tableFiltersForm = this.fb.group({
      tableReparto: this.tableReparto,
      tableYear: this.tableYear,
      tableMonth: this.tableMonth,
      tableYearFrom: this.tableYearFrom,
      tableYearTo: this.tableYearTo,
      maintenanceType: this.maintenanceType
    });
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.tableYear.setValue(currentYear.toString());

    const currentMonth = new Date().getMonth() + 1;
    this.tableMonth.setValue(currentMonth.toString());

    this.tableYearFrom.setValue((currentYear - 4).toString());
    this.tableYearTo.setValue(currentYear.toString());

    this.maintenanceType.setValue('predittiva');
    this.tableReparto.setValue('LLF');

    this.tableSearch.emit(this.tableFiltersForm.value);
  }

  onSubmit() {
    this.tableSearch.emit(this.tableFiltersForm.value);
  }
}

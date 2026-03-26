import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

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
  selector: 'global-filters',
  templateUrl: './global-filters.component.html',
  styleUrls: ['./global-filters.component.scss'],
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
export class GlobalFiltersComponent implements OnInit {
  //accordion
  panelOpenState = true;
  isMobile = false;

  @Input() dashboardInstance!: number;
  @Output() globalSearch = new EventEmitter<any>();

  globalForm: FormGroup;

  globalFrom: FormControl;
  globalTo: FormControl;

  globalFilters: any;

  typologies: Typology[] = [];
  tipology: FormControl;

  targets: Typology[] = [];
  target: FormControl;

  globalYears: Typology[] = [];
  globalYear: FormControl;

  globalYearFrom: FormControl;
  globalYearTo: FormControl;

  globalZones: Typology[] = [];
  globalZone: FormControl;

  constructor(
    private fb: FormBuilder,
    private filtersService: FiltersService,
    protected breakpointObserver: BreakpointObserver
  ) {
    this.target = new FormControl();
    this.tipology = new FormControl();
    this.globalYear = new FormControl();
    this.globalYearFrom = new FormControl((moment().year() - 2).toString());
    this.globalYearTo = new FormControl(moment().year().toString());
    this.globalZone = new FormControl();
    this.globalFrom = new FormControl(moment().startOf('year'));
    this.globalTo = new FormControl(moment());

    let currentYear = new Date().getFullYear();
    for (let i = 2013; i <= currentYear + 1; i++) {
      this.globalYears.push({ value: i.toString(), viewValue: i.toString() });
    }

    this.globalForm = this.fb.group({
      globalFrom: this.globalFrom,
      globalTo: this.globalTo,
      globalYear: this.globalYear,
      globalYearFrom: this.globalYearFrom,
      globalYearTo: this.globalYearTo,
      globalZone: this.globalZone,
      target: this.target,
      tipology: this.tipology
    });
  }

  ngOnInit(): void {
    this.filtersService.getGlobalFilters(this.dashboardInstance).subscribe({
      next: (value) => {
        this.globalFilters = value;

        this.globalFilters.forEach((filter: any) => {
          if (filter.type === 'autocomplete' && filter.name === 'zone_trasporti_ts') {
            this.filtersService.getGlobalValues(filter.name).subscribe({
              next: (value) => {
                this.globalZones = value.map((v) => {
                  return { value: v.zona, viewValue: v.zona };
                });
              }
            });
          }

          if (filter.type === 'autocomplete' && filter.label === 'Anno:') {
            this.globalYear.setValue(new Date().getFullYear().toString());
          }
        });
      }
    });
    this.matchViewport();
  }

  matchViewport(): void {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobile = true;
          this.panelOpenState = !this.isMobile;
        }
      });
  }

  chosenYearFromHandler(normalizedYear: Moment) {
    const ctrlValue = this.globalFrom.value;
    ctrlValue?.year(normalizedYear.year());
    this.globalFrom.setValue(ctrlValue);
  }

  chosenMonthFromHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.globalFrom.value;
    ctrlValue?.month(normalizedMonth.month());
    this.globalFrom.setValue(ctrlValue);
    datepicker.close();
  }

  chosenYearToHandler(normalizedYear: Moment) {
    const ctrlValue = this.globalTo.value;
    ctrlValue?.year(normalizedYear.year());
    this.globalTo.setValue(ctrlValue);
  }

  chosenMonthToHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.globalTo.value;
    ctrlValue?.month(normalizedMonth.month());
    this.globalTo.setValue(ctrlValue);
    datepicker.close();
  }

  onSubmit() {
    this.globalSearch.emit(this.globalForm.value);
  }
}

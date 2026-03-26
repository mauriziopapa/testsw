import moment from 'moment';
import { AfterViewInit, Component } from '@angular/core';
import { FilterValues } from '../models/filter-values';
import { Filters } from '../models/filters';
import { FiltersService } from '../services/filters.service';
import { KpiService } from '../services/kpi.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { DashboardService } from '../services/dashboard.service';
import { fromEvent, Subscription } from 'rxjs';

@Component({
    selector: 'base-kpi',
    template: ` <p></p> `,
    styles: [],
    standalone: false
})
export abstract class AbstractKPIComponent implements AfterViewInit {
  name = '';
  url = '';

  isMobile = false;

  filterValues = new Array<FilterValues>();
  filters = new Filters();
  global_filters: any;
  widget_instance!: number;
  kpi_number!: number;

  data: any;
  currentData: any;
  resizeSubscription: Subscription = new Subscription();

  constructor(
    protected kpiService: KpiService,
    protected filterService: FiltersService,
    protected dashboardService: DashboardService,
    protected breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar
  ) {}

  ngAfterViewInit() {
    this.matchViewport();

    this.resizeSubscription = fromEvent(window, 'windowResize')
      .subscribe((event: Event) => {
        console.log('resize on kpi', event);
        this.reload();
      });
  }

  matchViewport(): void {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => {
        const isMobile = state.matches;
        if (isMobile) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
        }
      });
  }

  updateFiltersSelection(event: any) {
    const { filterValues, formValues } = event;
    this.filterValues = filterValues;

    this.updateTarget(formValues);
    this.updateTipology(formValues);
    this.updateYear(formValues);
    this.updateYearFrom(formValues);
    this.updateYearTo(formValues);
    this.updateReparto(formValues);
    this.updatePde(formValues);
    this.updateZone(formValues);
    this.updateClient(formValues);
    this.updatePiece(formValues);
    this.updateOperator(formValues);
    this.updateFrom(formValues);
    this.updateTo(formValues);
  }

  updateGlobalFiltersSelection(event: any) {
    const formValues = event;

    this.updateTarget(formValues);
    this.updateTipology(formValues);
    this.updateYear(formValues);
    this.updateYearFrom(formValues);
    this.updateYearTo(formValues);
    this.updateReparto(formValues);
    this.updatePde(formValues);
    this.updateZone(formValues);
    this.updateClient(formValues);
    this.updatePiece(formValues);
    this.updateOperator(formValues);
    this.updateFrom(formValues);
    this.updateTo(formValues);
  }

  searchByFilters(filters: any) {
    this.filters.target = filters.target;
    this.filters.tipology = filters.tipology;
    this.filters.year = filters.year;
    this.filters.yearFrom = filters.yearFrom;
    this.filters.yearTo = filters.yearTo;
    this.filters.reparto = filters.reparto;
    this.filters.pde = filters.pde;
    this.filters.zone = filters.zone;
    this.filters.client = filters.client;
    this.filters.piece = filters.piece;
    this.filters.operator = filters.operator;
    this.filters.material = filters.material;
    this.filters.supplier = filters.supplier;
    this.filters.risk = filters.risk;
    this.filters.offer = filters.offer;
    this.filters.macroarea = filters.macroarea;
    this.filters.from = moment(filters.from).format('YYYY-MM');
    this.filters.to = moment(filters.to).format('YYYY-MM');

    this.kpiService.getKpi(this.url, this.filters, this.kpi_number).subscribe({
      next: (result) => {
        this.buildData(result);
      }
    });
  }

  reload(): void {
    this.kpiService.getKpi(this.url, this.filters, this.kpi_number).subscribe({
      next: (result) => {
        this.buildData(result);
      }
    });
  }

  saveFilters(): void {
    this.filterService.saveKpiFilters(this.widget_instance, this.filterValues).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }

  abstract buildData(result: any[]): void;

  private updateReparto(formValues: any) {
    this.filters.reparto = formValues.reparto != '' ? formValues.reparto : this.filters.reparto;
    this.updateFilterStringValue(this.filters.reparto, ['reparti_man_ts', 'reparto_ts']);
  }

  private updatePde(formValues: any) {
    this.filters.pde = formValues.pde != '' ? formValues.pde : this.filters.pde;
    this.updateFilterStringValue(this.filters.pde, ['pde_ts']);
  }

  private updateZone(formValues: any) {
    this.filters.zone = formValues.zone != '' ? formValues.zone : this.filters.zone;
    this.updateFilterStringValue(this.filters.zone, ['zone_trasporti_ts']);
  }

  private updateOperator(formValues: any) {
    this.filters.operator = formValues.operator != '' ? formValues.operator : this.filters.operator;
    this.updateFilterStringValue(this.filters.operator, ['operatori_ind_ts']);
  }

  private updatePiece(formValues: any) {
    this.filters.piece = formValues.piece != '' ? formValues.piece : this.filters.piece;
    this.updateFilterStringValue(this.filters.piece, ['pezzi_ind_ts']);
  }

  private updateClient(formValues: any) {
    this.filters.client = formValues.client != '' ? formValues.client : this.filters.client;
    this.updateFilterStringValue(this.filters.client, ['clienti_ind_ts']);
  }

  private updateYearTo(formValues: any) {
    this.filters.yearTo = formValues.yearTo != '' ? formValues.yearTo : this.filters.yearTo;
    this.updateFilterStringValue(this.filters.yearTo, ['al_anno_ts']);
  }

  private updateYearFrom(formValues: any) {
    this.filters.yearFrom = formValues.yearFrom != '' ? formValues.yearFrom : this.filters.yearFrom;
    this.updateFilterStringValue(this.filters.yearFrom, ['dal_anno_ts']);
  }

  private updateYear(formValues: any) {
    this.filters.year = formValues.year != '' ? formValues.year : this.filters.year;
    this.updateFilterStringValue(this.filters.year, ['anno_ts']);
  }

  private updateTipology(formValues: any) {
    this.filters.tipology = formValues.tipology != '' ? formValues.tipology : this.filters.tipology;
    this.updateFilterStringValue(this.filters.tipology, [
      'automtive_ts',
      'costi_concorrenti_ts',
      'nc_reparti_ts'
    ]);
  }

  private updateTarget(formValues: any) {
    this.filters.target = formValues.target != '' ? formValues.target : this.filters.target;
    this.updateFilterStringValue(this.filters.target, ['target']);
  }

  private updateTo(formValues: any) {
    this.filters.to = moment(formValues.to).format('YYYY-MM');
    const formattedDate = moment(formValues.to).format('MM-YYYY');
    this.updateFilterStringValue(formattedDate, ['al_month']);
  }

  private updateFrom(formValues: any) {
    this.filters.from = moment(formValues.from).format('YYYY-MM');
    const formattedDate = moment(formValues.from).format('MM-YYYY');
    this.updateFilterStringValue(formattedDate, ['dal_month']);
  }

  private updateFilterStringValue(filterValue: string, filterName: string[]) {
    const filter = this.filterValues.find((fv) => filterName.includes(fv.name));
    if (filter) {
      filter.default_value = filterValue;
    }
  }

  private openFailSnackBar() {
    this.snackBar.openFromComponent(FailSnackbarComponent, {
      duration: 1000,
      verticalPosition: 'top',
      panelClass: ['failUpdated']
    });
  }

  private openSuccessSnackBar() {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      duration: 6000,
      verticalPosition: 'top',
      panelClass: ['successUpdated']
    });
  }
}

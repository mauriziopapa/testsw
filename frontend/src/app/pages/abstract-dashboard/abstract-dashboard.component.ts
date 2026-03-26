import { CdkDragEnd, CdkDragEnter, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { AbstractKPIComponent } from 'src/app/kpi/abstract-kpi.component';
import { DashboardWidgets } from 'src/app/models/dashboard-widget';
import { Filters } from 'src/app/models/filters';
import { KpiInfo } from 'src/app/models/kpi-info';
import { Widget } from 'src/app/models/widget';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LoginService } from 'src/app/services/login.service';
import { WidgetService } from 'src/app/services/widget.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';
import { KpiDialogComponent } from 'src/app/shared/kpi-dialog/kpi-dialog.component';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
  selector: 'base-dashboard',
  template: ` <p></p> `,
  styles: []
})
export abstract class AbstractDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  kpis = new Array<Widget>();

  currentAdIndex = -1;
  dashboard_instance: number;

  @ViewChildren(WidgetDirective) widgets!: QueryList<WidgetDirective>;
  @ViewChildren(CdkDropList) dropsQuery!: QueryList<CdkDropList>;

  drops = new Array<CdkDropList>();
  componentsRefs = new Array<ComponentRef<AbstractKPIComponent>>();

  backgroundColor = '#058a41';
  url = '';

  isMobile = false;
  rowHeight = 12.5;
  cols = '3';
  colsOptions = [1, 2, 3, 4];

  resizeSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private loginService: LoginService,
    private widgetService: WidgetService,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    protected breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {
    this.url = this.router.url.replace('/', '');

    let currentUser = this.loginService.getCurrentUser();
    let currentDashboard = currentUser!.dashboards.filter((d) => d.url === this.url)[0];
    this.dashboard_instance = currentDashboard!.id;
    // imposto la visualizzazione della dashboard in base alle preferenze dell'utente
    dashboardService.setCols(parseInt(currentDashboard.cols));
    this.cols = currentDashboard.cols.toString();
    this.setKpiRowHeight();

    if (currentUser && currentUser.theme === 'red') {
      this.backgroundColor = '#c31421';
    } else {
      this.backgroundColor = '#058a41';
    }

    this.widgetService.getWidgets$(this.url).subscribe((kpis) => (this.kpis = kpis));
  }

  ngOnInit(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(500))
      .subscribe((event: Event) => {
        this.setKpiRowHeight();

        // fire a custom event to notify the kpis to resize
        const resizeEvent = new CustomEvent('windowResize');
        window.dispatchEvent(resizeEvent);
      });
  }

  ngOnDestroy() {
    this.drops = [];
  }

  // Why ngAfterViewInit() ?
  // Because the @ViewChild reference view will be available only in the ngAfterViewInit lifecyle hook
  ngAfterViewInit() {
    // FIXME Workaround
    setTimeout(() => {
      this.dropsQuery.changes.subscribe(() => {
        this.drops = this.dropsQuery.toArray();
      });
      Promise.resolve().then(() => {
        this.drops = this.dropsQuery.toArray();

        this.loadComponent();
      });
    }, 1000);

    this.matchViewport();
  }

  loadComponent() {
    const widgets = this.widgets.toArray();

    for (let i = 0; i < widgets.length; i++) {
      const el = widgets[i];
      const adItem = this.kpis[i];

      if (adItem.component) {
        const viewContainerRef = el.viewContainerRef;
        // clear() called on reference view will destroy any existing views
        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent<AbstractKPIComponent>(
          adItem.component
        );

        componentRef.instance.data = adItem.data;
        componentRef.instance.widget_instance = adItem.data.widget_instance;
        componentRef.instance.kpi_number = adItem.data.kpi;
        this.componentsRefs.push(componentRef);
      }
    }
  }

  entered($event: CdkDragEnter) {
    moveItemInArray(this.kpis, $event.item.data, $event.container.data);
  }

  ended($event: CdkDragEnd) {
    const widgets = this.kpis.map(
      (kpi, index) => new DashboardWidgets(kpi.data.widget_instance, index + 1)
    );
    this.widgetService.updateOrder(this.url, widgets).subscribe();
  }

  styleObject(): any {
    return {
      border: `4px solid ${this.backgroundColor}`
    };
  }

  openInfo(widgetData: any, index = -1) {
    let filters = new Filters();
    let url = '';

    // di default negativo per indicare di non entrare nell'array
    if (index >= 0) {
      const componentRef = this.componentsRefs[index];
      filters = componentRef.instance.filters;
      url = componentRef.instance.url;
    }

    this.widgetService.getWidgetInfo(widgetData.widget_instance).subscribe({
      next: (info: KpiInfo) => {
        this.dialog.open(KpiDialogComponent, {
          width: '40%',
          enterAnimationDuration: 0,
          exitAnimationDuration: 0,
          data: {
            title: info.name,
            info_kpi: info.info_kpi,
            fonti: info.fonti,
            kpi: widgetData.kpi,
            filters: filters,
            url: url != '' ? url : info.url
          },
          disableClose: false
        });
      }
    });
  }

  saveFilters(index: number): void {
    const componentRef = this.componentsRefs[index];
    componentRef.instance.saveFilters();
  }

  reload(index: number): void {
    const componentRef = this.componentsRefs[index];
    componentRef.instance.reload();
  }

  searchByGlobalFilters(globalFilters: any) {
    const filters = new Filters();
    filters.from = globalFilters.globalFrom;
    filters.to = globalFilters.globalTo;
    filters.zone = globalFilters.globalZone;
    filters.year = globalFilters.globalYear;
    filters.yearFrom = globalFilters.globalYearFrom;
    filters.yearTo = globalFilters.globalYearTo;
    this.componentsRefs.forEach((component) => {
      component.instance.global_filters = filters;
      const componentFilters = component.instance.filters;
      if (componentFilters) {
        filters.tipology = componentFilters.tipology;
        component.instance.updateGlobalFiltersSelection(filters);
        component.instance.reload();
      }
    });
  }

  matchViewport(): void {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          console.log('Matches small viewport or handset in portrait mode');
          this.isMobile = true;
          this.cols = '1';
        } else {
          console.log('Matches desktop viewport');
          this.isMobile = false;
          let currentDashboard = this.getCurrentDashboard();
          this.cols = currentDashboard!.cols.toString();
        }
      });
  }

  selectionChange(event: any) {
    this.dashboardService
      .updateDashboardColumns(this.dashboard_instance, this.cols)
      .subscribe({
        complete: () => {
          this.updateCurrentDashboardCols(this.cols);
          this.setKpiRowHeight();
          this.loadComponent();
        }
      })

      /* per dare feedback che è avvenuto l'aggiornamento a backend
      {
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    }
    */
  }

  setKpiRowHeight() {
    // filters and header occupy max 200px, canvas aspect ratio is 1.5
    // margin is 16px on each side
    // gutter is 15px between columns
    const pageWidth = window.innerWidth;
    const margins = 16 * 2;
    const gutters = 15 * (parseInt(this.cols) - 1); // 15px between columns
    const canvasAspectRatio = 1.5;
    // colWidth is calculated from the total horizontal space after margins and gutters, divided by the number of columns
    const colWidth = (pageWidth - margins - gutters) / parseInt(this.cols);
    const colHeight = (colWidth / canvasAspectRatio) + 200;
    this.rowHeight = colHeight;
    this.dashboardService.setColWidth(colWidth);
  }

  private openFailSnackBar() {
    this.snackBar.openFromComponent(FailSnackbarComponent, {
      duration: 6000,
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

  private getCurrentDashboard() {
    let currentUser = this.loginService.getCurrentUser();
    let currentDashboard = currentUser!.dashboards.find((d) => d.url === this.url);
    return currentDashboard;
  }

  private updateCurrentDashboardCols(cols: string) {
    const currentDashboard = this.getCurrentDashboard();
    if (currentDashboard) {
      currentDashboard.cols = cols;
    }
  }
}

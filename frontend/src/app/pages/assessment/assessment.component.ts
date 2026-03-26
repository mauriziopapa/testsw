import { CdkDropList } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ComponentRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { AbstractKPIComponent } from 'src/app/kpi/abstract-kpi.component';
import { Widget } from 'src/app/models/widget';
import { WidgetService } from 'src/app/services/widget.service';
import { AssessmentsService } from 'src/app/services/assessments.service';
import { AssessmentOption } from 'src/app/models/assessmentOption';
import { Assessment } from 'src/app/models/assessment';
import { WidgetConstants } from 'src/app/models/widget.constants';
import { LoginService } from 'src/app/services/login.service';
import { MatDialog } from '@angular/material/dialog';
import { KpiDialogComponent } from 'src/app/shared/kpi-dialog/kpi-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import domtoimage from 'dom-to-image-more';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KpiInfo } from 'src/app/models/kpi-info';
import { DashboardWidgets } from 'src/app/models/dashboard-widget';

@Component({
  selector: 'assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements AfterViewInit {
  cols = 1;

  opened = false;
  screenshotTaken = false;

  name = '';
  kpis = new Array<Widget>();
  options = new Array<AssessmentOption>();
  selectedTrimestre: AssessmentOption | undefined;

  assessment = new Array<Assessment>();

  currentAdIndex = -1;
  dashboard_instance = 0;
  dashboard_id = 0;

  @ViewChildren(WidgetDirective) widgets!: QueryList<WidgetDirective>;

  drops!: CdkDropList[];
  componentsRefs = new Array<ComponentRef<AbstractKPIComponent>>();

  backgroundColor = '#058a41';

  constructor(
    private route: ActivatedRoute,
    private widgetService: WidgetService,
    private loginService: LoginService,
    private assessmentsService: AssessmentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.route.params.subscribe((params: Params) => {
      this.name = params['name'];

      let currentUser = this.loginService.getCurrentUser();
      let currentDashboard = currentUser!.dashboards.filter((d) => d.url === this.name)[0];
      this.dashboard_instance = currentDashboard!.id;
      this.dashboard_id = currentDashboard!.iddashboard;
      if (currentUser && currentUser.theme === 'red') {
        this.backgroundColor = '#c31421';
      } else {
        this.backgroundColor = '#058a41';
      }

      this.widgetService.getDashboardWidgets(this.name).subscribe({
        next: (widgets: DashboardWidgets[]) => {
          this.kpis = widgets.map((w) => {
            return new Widget(WidgetConstants.getWidgetNameFromId(w.idwidget), {
              cols: 1,
              rows: 1,
              title: w.name,
              url: w.url,
              widget_instance: w.idwidget_instance,
              kpi: w.idwidget,
              position: w.position,
              checked: false
            });
          });

          this.kpis.forEach((kpi) => {
            this.assessment.push(new Assessment());
          });
        }
      });
    });

    this.assessmentsService.getAssessmentList().subscribe({
      next: (list: AssessmentOption[]) => {
        this.options = list;
      }
    });
  }

  // Why ngAfterViewInit() ?
  // Because the @ViewChild reference view will be available only in the ngAfterViewInit lifecyle hook
  ngAfterViewInit() {
    // FIXME Workaround
    setTimeout(() => {
      this.loadComponent();
    }, 1000);
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

  openInfo(widgetData: any) {
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
            kpi: widgetData.kpi
          },
          disableClose: true
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

  takeScreen(index: number) {
    const name = this.componentsRefs[index].instance.name;
    // nascondo le icone che altrimenti non si vedono bene
    document.getElementById(`kpi-save-${index}`)!.style.display = 'none';
    document.getElementById(`kpi-repeat-${index}`)!.style.display = 'none';
    document.getElementById(`kpi-info-${index}`)!.style.display = 'none';
    const collection = Array.from(
      document.getElementsByClassName('search-icon-kpi') as HTMLCollectionOf<HTMLElement>
    );
    for (let i = 0; i < collection.length; i++) {
      collection[i]!.style.display = 'none';
    }

    const node = <Node>document.getElementById(`kpi-${index}`);

    let self = this;

    domtoimage
      .toPng(node)
      .then((dataUrl) => {
        self.screenshotTaken = true;
        const node = document.getElementById(`snap-${index}`) as HTMLImageElement;
        node!.src = dataUrl;
        // ripristino le icone
        document.getElementById(`kpi-save-${index}`)!.style.display = 'block';
        document.getElementById(`kpi-repeat-${index}`)!.style.display = 'block';
        document.getElementById(`kpi-info-${index}`)!.style.display = 'block';
        for (let i = 0; i < collection.length; i++) {
          collection[i]!.style.display = 'block';
        }
      })
      .catch((error) => {
        console.error('oops, something went wrong!', error);
      });
  }

  cancelScreen(index: number) {
    const node = document.getElementById(`snap-${index}`) as HTMLImageElement;
    node!.src = '/assets/dummy-snap.jpg';
    this.screenshotTaken = false;
  }

  saveScreen(index: number) {
    this.screenshotTaken = false;
    const node = document.getElementById(`snap-${index}`) as HTMLImageElement;
    const file = this.dataURIToBlob(node!.src);
    const formData = new FormData();
    const fk_widget = this.assessment[index].fk_widget.toString();
    formData.append('upload', file, fk_widget);
    formData.append('fk_widget', fk_widget);
    formData.append('anno', this.selectedTrimestre!.anno.toString());
    formData.append('trimestre', this.selectedTrimestre!.trimestre);

    this.assessmentsService.saveScreenshot(formData).subscribe(); //send formData in body
  }

  openAssessment() {
    this.assessmentsService
      .getAssessment(
        this.selectedTrimestre!.anno,
        this.selectedTrimestre!.trimestre,
        this.name,
        this.dashboard_instance
      )
      .subscribe({
        next: (assessment: Assessment[]) => {
          this.openSuccessSnackBar('Assessment aperto e dati caricati.');
          this.opened = true;
          this.assessment = assessment.filter((ass) => {
            return this.kpis.some((kpi) => kpi.data.kpi == ass.fk_widget);
          });

          const missingKpis = this.kpis.filter((kpi) => {
            return !this.assessment.some((ass) => kpi.data.kpi == ass.fk_widget);
          });

          missingKpis.forEach((mKpi) => {
            const ass = new Assessment();
            ass.fk_widget = mKpi.data.kpi;
            ass.anno = this.selectedTrimestre!.anno;
            ass.trimestre = this.selectedTrimestre!.trimestre;
            this.assessment.push(ass);
          });

          this.assessment.forEach((ass) => {
            this.kpis.forEach((kpi) => {
              if (kpi.data.kpi == ass.fk_widget) {
                kpi.data.checked = ass.esporta;
              }
            });
          });

          console.log(this.assessment);
        }
      });
  }

  closeAssessment() {
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '30%',
        enterAnimationDuration: 0,
        exitAnimationDuration: 0,
        data: {
          title: "Chiudere l'assessment? ",
          message: 'Eventuali modifiche su screenshot e note non salvate andranno perdute.'
        },
        disableClose: true
      })
      .afterClosed()
      .subscribe((confirmed: Boolean) => {
        if (confirmed) {
          this.opened = false;
          this.assessment = new Array<Assessment>();
          this.kpis.forEach((kpi) => {
            this.assessment.push(new Assessment());
          });
        }
      });
  }

  saveAssessment() {
    /*
    const kpiToExport = this.kpis.filter((kpi) => kpi.data.checked);
    const assToExport = this.assessment.filter((ass) => {
      return kpiToExport.some((kpi) => kpi.data.kpi == ass.fk_widget);
    });
    */
    // update assessments
    this.assessment.forEach((ass) => {
      ass.fk_dashboard = this.dashboard_id;
      ass.anno = this.selectedTrimestre!.anno;
      ass.trimestre = this.selectedTrimestre!.trimestre;
    });
    this.assessmentsService.saveAssessment(this.assessment).subscribe({
      next: () => {
        this.openSuccessSnackBar('Dati salvati correttamente.');
      },
      error: () => {
        this.openFailSnackBar();
      }
    });
  }

  exportAssessment() {
    this.assessment.forEach((ass) => (ass.fk_dashboard = this.dashboard_id));
    this.assessmentsService.saveAssessment(this.assessment).subscribe({
      next: () => {
        this.assessmentsService.exportAssessment(
          this.selectedTrimestre!.anno,
          this.selectedTrimestre!.trimestre,
          this.dashboard_id,
          this.dashboard_instance
        );
      }
    });
  }

  checked(widget: Widget): void {
    const assToExport = this.assessment.filter((ass) => {
      return widget.data.kpi == ass.fk_widget;
    });

    assToExport[0].esporta = widget.data.checked;
  }

  private dataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',');
    const byteString =
      splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  protected openFailSnackBar() {
    this.snackBar.open('Si è verificato un errore.', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['failUpdated']
    });
  }

  protected openSuccessSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 1000,
      verticalPosition: 'top',
      panelClass: ['successUpdated']
    });
  }
}

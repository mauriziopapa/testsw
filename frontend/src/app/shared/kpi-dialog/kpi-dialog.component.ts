import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Target } from 'src/app/models/target';
import { TargetService } from 'src/app/services/target.service';
import { FailSnackbarComponent } from '../fail-snackbar/fail-snackbar.component';
import { SuccessSnackbarComponent } from '../success-snackbar/success-snackbar.component';
import { Filters } from 'src/app/models/filters';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'kpi-dialog',
  templateUrl: './kpi-dialog.component.html',
  styleUrls: ['./kpi-dialog.component.scss']
})
export class KpiDialogComponent {
  title = 'Info';
  info = '';
  fonti = '';
  url = '';
  kpi = '';
  target = 0.0;
  debug: any | undefined;
  filters = new Filters();

  year = new Date().getFullYear();
  yearOptions = new Array<string>();

  constructor(
    private snackBar: MatSnackBar,
    private kpiService: KpiService,
    private targetService: TargetService,
    public dialogRef: MatDialogRef<KpiDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ModalData
  ) {
    this.title = data.title;
    this.info = data.info_kpi;
    this.fonti = data.fonti;
    this.kpi = data.kpi;
    this.url = data.url;
    this.filters = data.filters;

    let currentYear = new Date().getFullYear();
    for (let i = 2008; i <= currentYear + 1; i++) {
      this.yearOptions.push(i.toString());
    }
    this.targetService.getTarget(this.kpi, currentYear).subscribe({
      next: (target: Target) => {
        if (target != null) {
          this.target = target.target;
        }
      }
    });
  }

  selectionChange(event: any) {
    this.targetService.getTarget(this.kpi, this.year).subscribe({
      next: (target: Target) => {
        if (target) {
          this.target = target.target;
        } else {
          this.target = 0;
        }
      }
    });
  }

  debugDatasource() {
    const url = `${this.url}/debug`;
    this.kpiService.getKpi(url, this.filters, parseInt(this.kpi)).subscribe({
      next: (result) => {
        console.log(result);
        this.debug = result;
      }
    });
  }

  updateTarget() {
    const target = new Target(this.kpi, this.year, this.target, 0);
    this.targetService.saveTarget(target).subscribe({
      next: () => {
        this.openSuccessSnackBar();
      },
      error: (err: any) => {
        this.openFailSnackBar();
      }
    });
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

  openSnackBar() {
    this.snackBar.openFromComponent(SuccessSnackbarComponent, {
      duration: 1000,
      verticalPosition: 'top',
      panelClass: ['successUpdated']
    });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }
}

interface ModalData {
  title: string;
  info_kpi: string;
  fonti: string;
  kpi: string;
  url: string;
  filters: Filters;
}

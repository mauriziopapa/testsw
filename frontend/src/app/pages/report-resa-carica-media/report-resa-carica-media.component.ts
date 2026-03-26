import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { ReportResaCaricaMedia } from 'src/app/models/report-resa-carica-media';

import { ResaCaricaMediaService } from 'src/app/services/resa-carica.service';
import { FailSnackbarComponent } from 'src/app/shared/fail-snackbar/fail-snackbar.component';

@Component({
  selector: 'report-resa-carica-media',
  templateUrl: './report-resa-carica-media.component.html',
  styleUrls: ['./report-resa-carica-media.component.scss']
})
export class ReportResaCaricaMediaComponent {
  tableName = 'report-resa-carica-media';

  dataSource = new Array<ReportResaCaricaMedia>();
  header = new ReportResaCaricaMedia();

  tableFilters!: any;
  modified = false;

  constructor(private resaCaricaService: ResaCaricaMediaService, private snackBar: MatSnackBar) {}

  searchByTableFilters(tableFilters: any) {
    this.tableFilters = tableFilters;
    this.resaCaricaService.get(tableFilters.tableYear, tableFilters.tableReparto).subscribe({
      next: (response) => {
        this.dataSource = response;
        console.log(this.dataSource);
      },
      error: (err) => {
        this.openFailSnackBar();
      }
    });
  }

  public keepOriginalOrder = (a: any, b: any) => a.key;

  private openFailSnackBar() {
    this.snackBar.openFromComponent(FailSnackbarComponent, {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['failUpdated']
    });
  }
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { KpiDialogComponent } from './kpi-dialog/kpi-dialog.component';
import { GlobalFiltersComponent } from './global-filters/global-filters.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { KpiFiltersComponent } from './kpi-filters/kpi-filters.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableFiltersComponent } from './table-filters/table-filters.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from './success-snackbar/success-snackbar.component';
import { FailSnackbarComponent } from './fail-snackbar/fail-snackbar.component';
import { PercentagePipe } from './percent-pipe/percent.pipe';
import { GenericTableComponent } from './generic-table/generic-table.component';
import { TableDataWithMonthsComponent } from './table-data-with-months/table-data-with-months.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    KpiDialogComponent,
    ConfirmationDialogComponent,
    GlobalFiltersComponent,
    TableFiltersComponent,
    KpiFiltersComponent,
    SuccessSnackbarComponent,
    FailSnackbarComponent,
    GenericTableComponent,
    TableDataWithMonthsComponent,
    PercentagePipe
  ],
  imports: [
    //vendor
    CommonModule,
    RouterModule,

    //material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    DragDropModule,
    MatIconModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatSelectModule,
    MatTableModule,
    MatSnackBarModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    ClipboardModule

    //custom
  ],
  exports: [
    //vendor
    CommonModule,
    RouterModule,

    //material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    DragDropModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSelectModule,
    MatTableModule,
    MatSnackBarModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,

    //custom
    GlobalFiltersComponent,
    KpiFiltersComponent,
    TableFiltersComponent,
    SuccessSnackbarComponent,
    FailSnackbarComponent,
    GenericTableComponent,
    TableDataWithMonthsComponent,
    PercentagePipe
  ]
})
export class SharedModule {}

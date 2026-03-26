import { Component } from '@angular/core';
import { Value } from 'src/app/models/value';
import { ReportService } from 'src/app/services/report.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { FiltersService } from 'src/app/services/filters.service';

@Component({
    selector: 'report-acquisti',
    imports: [SharedModule],
    templateUrl: './report-acquisti.component.html',
    styleUrls: ['./report-acquisti.component.scss']
})
export class ReportAcquistiComponent {
  name = 'report-acquisti';
  url = 'report_acquisti';

  reports = new Array<Value>();
  filterValues = new Array();
  filters = new Object();
  widget_instance!: number;
  saveFilters = new Array();

  constructor(private reportService: ReportService, private filterService: FiltersService) {
    this.filterService.getKpiFilters(this.widget_instance).subscribe({
      next: (filters) => {
        this.filters = filters;
      }
    });
    this.filterService.saveKpiFilters(this.widget_instance, this.filterValues).subscribe({
      next: (result) => {
        console.log(result);
      }
    });
    this.reportService.getReport(this.url).subscribe({
      next: (reports) => {
        this.reports = reports;
      }
    });
  }
}

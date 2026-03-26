import { Component } from '@angular/core';
import { Value } from 'src/app/models/value';
import { ReportService } from 'src/app/services/report.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'report-commerciale',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './report-commerciale.component.html',
  styleUrls: ['./report-commerciale.component.scss']
})
export class ReportCommercialeComponent {
  name = 'report-commerciale';
  url = 'report_commerciale';

  reports = new Array<Value>();

  constructor(private reportService: ReportService) {
    this.reportService.getReport(this.url).subscribe({
      next: (reports) => {
        this.reports = reports;
      }
    });
  }
}

import { Component } from '@angular/core';
import { Value } from 'src/app/models/value';
import { ReportService } from 'src/app/services/report.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'report-induzione',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './report-induzione.component.html',
  styleUrls: ['./report-induzione.component.scss']
})
export class ReportInduzioneComponent {
  name = 'report-induzione';
  url = 'report_induzione';

  reports = new Array<Value>();

  constructor(private reportService: ReportService) {
    this.reportService.getReport(this.url).subscribe({
      next: (reports) => {
        this.reports = reports;
      }
    });
  }
}

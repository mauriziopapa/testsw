import { Component } from '@angular/core';
import { Value } from 'src/app/models/value';
import { ReportService } from 'src/app/services/report.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'report-produzione',
    imports: [SharedModule],
    templateUrl: './report-produzione.component.html',
    styleUrls: ['./report-produzione.component.scss']
})
export class ReportProduzioneComponent {
  name = 'report-produzione';
  url = 'report_produzione';

  reports = new Array<Value>();

  constructor(private reportService: ReportService) {
    this.reportService.getReport(this.url).subscribe({
      next: (reports) => {
        this.reports = reports;
      }
    });
  }
}

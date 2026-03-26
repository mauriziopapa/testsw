import moment from 'moment';
import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { KpiData } from 'src/app/models/kpi-data';

@Component({
    selector: 'nc-ambiente',
    imports: [BarChartModule, SharedModule],
    templateUrl: './nc-ambiente.component.html',
    styleUrls: ['./nc-ambiente.component.scss']
})
export class NCAmbienteComponent extends AbstractKPIComponent {
  override name = 'nc-ambiente';
  override url = 'nc_reparti/ambiente';

  override searchByFilters(filters: any) {
    this.filters.target = filters.target;
    this.filters.from = moment(filters.from).format('YYYY-MM');
    this.filters.to = moment(filters.to).format('YYYY-MM');

    this.kpiService.getKpi(this.url, this.filters, this.kpi_number).subscribe({
      next: (result) => {
        this.buildData(result);
      }
    });
  }

  buildData(result: any[]): void {
    this.currentData = KpiData.buildStandardBarData(result);
  }
}

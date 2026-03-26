import moment from 'moment';
import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { KpiData } from 'src/app/models/kpi-data';

@Component({
  selector: 'nc-qualita',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './nc-qualita.component.html',
  styleUrls: ['./nc-qualita.component.scss']
})
export class NCQualitaComponent extends AbstractKPIComponent {
  override name = 'nc-qualita';
  override url = 'nc_reparti/qualità';

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

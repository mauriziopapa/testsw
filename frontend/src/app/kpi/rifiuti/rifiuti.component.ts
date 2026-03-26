import { Component } from '@angular/core';
import { ChartType } from 'chart.js';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'rifiuti',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './rifiuti.component.html',
  styleUrls: ['./rifiuti.component.scss']
})
export class RifiutiComponent extends AbstractKPIComponent {
  override name = 'rifiuti';
  override url = 'rifiuti';
  nc_tot = 0;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      let data = result[0].data;
      const labels = data.map((d: any) => d.label);
      const data1 = data.map((d: any) => d.val_automotive);
      const data2 = data.map((d: any) => d.val_nonautomotive);
      const targets = data.map((d: any) => d.target);
      const medi_automotive = data.map((d: any) => d.nc_medi_automotive);
      const medi_nonautomotive = data.map((d: any) => d.nc_medi_nonautomotive);

      const datasets = [
        ChartData.buildAutomotive(data1),
        ChartData.buildNonAutomotive(data2),
        ChartTarget.buildTarget(targets),
        {
          type: 'line' as ChartType,
          label: '#8Dmedi Automotive',
          data: medi_automotive,
          fill: false,
          pointRadius: 1,
          borderWidth: 2,
          pointStyle: 'line',
          borderColor: '#ff9900',
          backgroundColor: '#ff9900'
        },
        {
          type: 'line' as ChartType,
          label: '#8Dmedi Non Automotive',
          data: medi_nonautomotive,
          fill: false,
          pointRadius: 1,
          borderWidth: 2,
          pointStyle: 'line',
          borderColor: '#3366cc',
          backgroundColor: '#3366cc'
        }
      ];

      this.currentData = { labels, datasets };
      this.nc_tot = result[0].nc_tot;
    }
  }
}

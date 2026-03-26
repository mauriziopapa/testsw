import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'd8-tempo-chiusura',
    imports: [BarChartModule, SharedModule],
    templateUrl: './8d-tempo-chiusura.component.html',
    styleUrls: ['./8d-tempo-chiusura.component.scss']
})
export class D8TempoChiusuraComponent extends AbstractKPIComponent {
  override name = '8d-tempo-chiusura';
  override url = '8d_tempo_chiusura';
  nc_tot = 0;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      let data = result[0].data;
      const labels = data.map((d: any) => d.label);
      const automotive = data.map((d: any) => d.automotive);
      const non_automotive = data.map((d: any) => d.non_automotive);
      const media_mobile = data.map((d: any) => d.movingAvg);
      const targets = data.map((d: any) => d.target);

      const datasets = KpiData.buildStandardAutomotiveNonAutomotiveData(
        automotive,
        non_automotive,
        targets,
        this.filters.tipology
      );

      if (
        this.filters.tipology === '-tutte-' ||
        this.filters.tipology === 'automotive' ||
        this.filters.tipology === 'non_automotive'
      ) {
        datasets.push(
          ChartTarget.buildLine(media_mobile, 'Media mobile', Colors.VIOLET, Colors.VIOLET)
        );
      }

      this.currentData = { labels, datasets };
      this.nc_tot = result[0].nc_tot;
    }
  }
}

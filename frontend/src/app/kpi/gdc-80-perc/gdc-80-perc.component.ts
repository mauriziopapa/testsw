import { Component } from '@angular/core';
import { LineChartModule } from 'src/app/charts/line-chart/line-chart.module';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'gdc-80-perc',
  standalone: true,
  imports: [LineChartModule, SharedModule],
  templateUrl: './gdc-80-perc.component.html',
  styleUrls: ['./gdc-80-perc.component.scss']
})
export class GDC80PercComponent extends AbstractKPIComponent {
  override name = 'gdc-80-perc';
  override url = 'gdc_80_perc';
  currentOptions: any;

  buildData(result: any): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const valoriAnnui = result.map((d) => d.valori);
      const targets = result.map((d) => d.target);

      const datasetArray = KpiData.buildFromMapToArray(valoriAnnui);

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartTarget.buildLineWithRadius(arr.data, arr.label, color, hoverColor, 2, 3);
        }),
        ChartTarget.buildTarget(targets)
      ];

      this.currentData = { labels, datasets };

      this.currentOptions = KpiOptions.buildOptionWithBottomLegend();
    }
  }
}

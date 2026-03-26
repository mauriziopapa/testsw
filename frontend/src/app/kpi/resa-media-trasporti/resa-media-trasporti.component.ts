import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'resa-media-trasporti',
    imports: [BarChartModule, SharedModule],
    templateUrl: './resa-media-trasporti.component.html',
    styleUrls: ['./resa-media-trasporti.component.scss']
})
export class ResaMediaTrasportiComponent extends AbstractKPIComponent {
  override name = 'resa-media-trasporti';
  override url = 'resa_media_trasporti';
  currentOptions: any;

  buildData(result: any): void {
    if (result) {
      const labels = result.data.map((d: any) => d.label);
      const valori = result.data.map((d: any) => d.valori);
      const targets = result.data.map((d: any) => d.target);

      const datasetArray = KpiData.buildFromMapToArray(valori);

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        }),
        ChartTarget.buildTarget(targets)
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('kg');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

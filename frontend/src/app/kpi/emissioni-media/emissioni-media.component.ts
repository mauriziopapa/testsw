import { Component } from '@angular/core';
import { LineChartModule } from 'src/app/charts/line-chart/line-chart.module';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'emissioni-media',
  standalone: true,
  imports: [LineChartModule, SharedModule],
  templateUrl: './emissioni-media.component.html',
  styleUrls: ['./emissioni-media.component.scss']
})
export class EmissioniMediaComponent extends AbstractKPIComponent {
  override name = 'emissioni-media';
  override url = 'emissioni_media';
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
        })
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('mg/Nm3');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

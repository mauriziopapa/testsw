import { Component } from '@angular/core';
import { ChartType } from 'chart.js';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'rapidita-campionature',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './rapidita-campionature.component.html',
  styleUrls: ['./rapidita-campionature.component.scss']
})
export class RapiditaCampionatureComponent extends AbstractKPIComponent {
  override name = 'rapidita-campionature';
  override url = 'rapidita_campionature';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const automotive = result.map((d) => d.automotive);
      const non_automotive = result.map((d) => d.non_automotive);
      const targets = result.map((d) => d.target);
      const avgAuto = result.map((d) => d.movingAverageAuto);
      const avgNonAuto = result.map((d) => d.movingAverageNonAuto);

      const datasets = [];
      if (this.filters.tipology === '-tutte-' || this.filters.tipology === 'automotive') {
        datasets.push(ChartData.buildAutomotive(automotive));
        datasets.push(
          ChartTarget.buildLine(avgAuto, 'Media Mobile Automotive', Colors.ORANGE, Colors.ORANGE)
        );
      }

      if (this.filters.tipology === '-tutte-' || this.filters.tipology === 'non_automotive') {
        datasets.push(ChartData.buildNonAutomotive(non_automotive));
        datasets.push(
          ChartTarget.buildLine(avgNonAuto, 'Media Mobile NON Automotive', Colors.BLUE, Colors.BLUE)
        );
      }

      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('gg');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

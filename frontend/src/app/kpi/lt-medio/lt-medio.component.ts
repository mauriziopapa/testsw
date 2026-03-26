import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'lt-medio',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './lt-medio.component.html',
  styleUrls: ['./lt-medio.component.scss']
})
export class LTMedioComponent extends AbstractKPIComponent {
  override name = 'lt-medio';
  override url = 'lt_medio';
  currentOptions: any;

  buildData(result: any): void {
    if (result) {
      const labels = result.resultFilter.map((d: any) => d.label);
      const givenFilterData = result.resultFilter.map((d: any) => d.lt);
      const lastYearData = result.lastYearFilters.map((d: any) => d.lt);

      const datasets = [
        ChartData.builCustomdBar(givenFilterData, 'LT Medio Gruppo', Colors.GREEN, Colors.GREEN_HOVER),
        ChartData.builCustomdBar(lastYearData, 'LT Medio Gruppo Prec', Colors.ORANGE, Colors.ORANGE_HOVER),
        ChartTarget.buildLine(result.lt_ponderato, 'LT Medio Generale', Colors.VIOLET, Colors.VIOLET_HOVER),
        ChartTarget.buildTarget(result.target)
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('gg');
      this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
    }
  }
}

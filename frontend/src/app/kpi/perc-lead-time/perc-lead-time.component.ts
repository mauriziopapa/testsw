import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'perc-lead-time',
    imports: [BarChartModule, SharedModule],
    templateUrl: './perc-lead-time.component.html',
    styleUrls: ['./perc-lead-time.component.scss']
})
export class PercLeadTimeComponent extends AbstractKPIComponent {
  override name = 'perc-lead-time';
  override url = 'perc_lead_time';
  currentOptions: any;

  buildData(result: any): void {
    if (result) {
      const labels = result.resultFilter.map((d: any) => d.label);
      const givenFilterData = result.resultFilter.map((d: any) => d.perc_in_ritardo);
      const lastYearData = result.lastYearFilters.map((d: any) => d.perc_in_ritardo);


      const datasets = [
        ChartData.builCustomdBar(givenFilterData, '% in ritardo Gruppo', Colors.GREEN, Colors.GREEN_HOVER),
        ChartData.builCustomdBar(lastYearData, '% in ritardo Gruppo Prec', Colors.ORANGE, Colors.ORANGE_HOVER),

        ChartTarget.buildLine(result.ritardo_perc_medio, '% in ritardo Generale', Colors.VIOLET, Colors.VIOLET_HOVER),
        ChartTarget.buildTarget(result.target)
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
    }
  }
}

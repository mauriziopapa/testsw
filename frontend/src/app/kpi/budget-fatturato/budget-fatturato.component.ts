import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'budget-fatturato',
    imports: [BarChartModule, SharedModule],
    templateUrl: './budget-fatturato.component.html',
    styleUrls: ['./budget-fatturato.component.scss']
})
export class BudgetFatturatoComponent extends AbstractKPIComponent {
  override name = 'budget-fatturato';
  override url = 'budget_fatturato';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const valori = result.map((d) => d.valori);

      const datasetArray = KpiData.buildFromMapToArray(valori);
      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        })
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildCurrencyTooltip('EUR');

      if (this.isMobile) {
        this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
      }
    }
  }
}

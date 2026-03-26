import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'fatturato-cdl-confronto',
    imports: [BarChartModule, SharedModule],
    templateUrl: './fatturato-cdl-confronto.component.html',
    styleUrls: ['./fatturato-cdl-confronto.component.scss']
})
export class FatturatoCdlConfrontoComponent extends AbstractKPIComponent {
  override name = 'fatturato-cdl-confronto';
  override url = 'fatturato_cdl_confronto';
  currentOptions: any;
  formattedValue = '0';

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);
      const stacks = new Set(stackArray);

      let sum = 0;
      if (stackValues && stackValues.length > 0) {
        stackValues[1].data.forEach((v: any) => {
          sum += parseFloat(v.data);
        });
      }
      this.formattedValue = new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(sum);

      const stackTotals = KpiOptions.calculateStackTotals(stackValues);
      labels.forEach((label, index) => {
        const totalFormattedValue = new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR'
        }).format(stackTotals[index]);
        labels[index] = [label, totalFormattedValue];
      });

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildCurrencyTooltip('EUR');

      if (this.isMobile) {
        this.currentOptions =
          KpiOptions.buildStackedOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
      }
    }
  }
}

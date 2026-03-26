import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'quote-di-mercato',
    imports: [StackedBarChartModule, SharedModule],
    templateUrl: './quote-di-mercato.component.html',
    styleUrls: ['./quote-di-mercato.component.scss']
})
export class QuoteDiMercatoComponent extends AbstractKPIComponent {
  override name = 'quote-di-mercato';
  override url = 'quote_di_mercato';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);
      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildCurrencyTooltip('EUR');
      this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
    }
  }
}

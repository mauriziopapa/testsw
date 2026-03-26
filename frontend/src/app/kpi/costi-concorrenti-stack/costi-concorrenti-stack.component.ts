import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'costi-concorrenti-stack',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './costi-concorrenti-stack.component.html',
  styleUrls: ['./costi-concorrenti-stack.component.scss']
})
export class CostiConcorrentiStackComponent extends AbstractKPIComponent {
  override name = 'costi-concorrenti-stack';
  override url = 'costi_concorrenti/stack';
  currentOptions: any;

  override searchByFilters(filters: any) {
    this.filters.target = filters.target;
    this.filters.yearFrom = filters.yearFrom;
    this.filters.yearTo = filters.yearTo;
    this.filters.tipology = '-tutte-';

    this.kpiService.getKpi(this.url, this.filters, this.kpi_number).subscribe({
      next: (result) => {
        this.buildData(result);
      }
    });
  }

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);
      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltipNoLegend(tooltip);
    }
  }
}

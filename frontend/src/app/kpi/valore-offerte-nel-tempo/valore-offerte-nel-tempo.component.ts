import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'valore-offerte-nel-tempo',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './valore-offerte-nel-tempo.component.html',
  styleUrls: ['./valore-offerte-nel-tempo.component.scss']
})
export class ValoreOfferteNelTempoComponent extends AbstractKPIComponent {
  override name = 'valore-offerte-nel-tempo';
  override url = 'valore_offerte_nel_tempo';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const targets = result.map((d) => d.target);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);
      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);
      datasets.push(ChartTarget.buildTarget(targets));

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

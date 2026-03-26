import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'motivi-rinuncia-valore-ts',
    imports: [StackedBarChartModule, SharedModule],
    templateUrl: './motivi-rinuncia-valore-ts.component.html',
    styleUrls: ['./motivi-rinuncia-valore-ts.component.scss']
})
export class MotiviRinunciaValoreTSComponent extends AbstractKPIComponent {
  override name = 'motivi-rinuncia-valore-ts';
  override url = 'motivi_rinuncia_valore_ts';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);
      const stacks = new Set(stackArray);

      // Troviamo la lunghezza massima tra i vari dataset
      const maxLength = Math.max(...result.map((r) => r.valori.data.length || 0));

      // Normalizziamo i valori degli stack per avere la stessa lunghezza
      const normalizedStackValues = stackValues.map((value) => {
        const normalizedValues = Array.from({ length: maxLength }, (_, i) => {
          const stackValue = value.data[i];
          return stackValue ? stackValue : { label: 'STAND BY', data: 0 };
        });
        return { label: '', data: normalizedValues };
      });

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, normalizedStackValues);

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

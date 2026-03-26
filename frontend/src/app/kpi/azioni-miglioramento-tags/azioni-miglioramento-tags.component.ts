import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { ChartTarget } from 'src/app/models/chart-target';

@Component({
    selector: 'azioni-miglioramento-tags',
    imports: [StackedBarChartModule, SharedModule],
    templateUrl: './azioni-miglioramento-tags.component.html',
    styleUrls: ['./azioni-miglioramento-tags.component.scss']
})
export class AzioniMiglioramentoTagsComponent extends AbstractKPIComponent {
  override name = 'azioni-miglioramento-tags';
  override url = 'azioni_miglioramento_tags';
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

      const tooltip = KpiOptions.buildTooltipWith('#');
      this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
    }
  }
}

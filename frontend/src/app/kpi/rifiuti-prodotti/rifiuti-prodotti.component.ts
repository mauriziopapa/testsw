import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { ChartGroupData } from 'src/app/models/chart-group-data';

@Component({
  selector: 'rifiuti-prodotti',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './rifiuti-prodotti.component.html',
  styleUrls: ['./rifiuti-prodotti.component.scss']
})
export class RifiutiProdottiComponent extends AbstractKPIComponent {
  override name = 'rifiuti-prodotti';
  override url = 'rifiuti_prodotti';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const targets = result.map((d: any) => d.target);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);

      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('Kg/q');

      this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
    }
  }
}

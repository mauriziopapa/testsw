import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { ChartTarget } from 'src/app/models/chart-target';

@Component({
  selector: 'nc-reparti',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './nc-reparti.component.html',
  styleUrls: ['./nc-reparti.component.scss']
})
export class NCRepartiComponent extends AbstractKPIComponent {
  override name = 'nc-reparti';
  override url = 'nc_reparti';
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

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
    }
  }
}

import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'motivi-rinuncia-numero',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './motivi-rinuncia-numero.component.html',
  styleUrls: ['./motivi-rinuncia-numero.component.scss']
})
export class MotiviRinunciaNumeroComponent extends AbstractKPIComponent {
  override name = 'motivi-rinuncia-numero';
  override url = 'motivi_rinuncia_numero';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const stackArray = result.flatMap((r) => r.valori).map((l) => l.label);
      const stackValues = result.flatMap((r) => r.valori);
      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('#');

      if (this.isMobile) {
        this.currentOptions =
          KpiOptions.buildStackedOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
      }
    }
  }
}

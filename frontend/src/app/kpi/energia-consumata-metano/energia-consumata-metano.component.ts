import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartTarget } from 'src/app/models/chart-target';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { StackedBarChartModule } from "../../charts/stacked-bar-chart/stacked-bar-chart.module";
import { ChartGroupData } from 'src/app/models/chart-group-data';

@Component({
  selector: 'energia-consumata-metano',
  standalone: true,
  imports: [SharedModule, StackedBarChartModule],
  templateUrl: './energia-consumata-metano.component.html',
  styleUrls: ['./energia-consumata-metano.component.scss']
})
export class EnergiaConsumataMetanoComponent extends AbstractKPIComponent {
  override name = 'energia-consumata-metano';
  override url = 'energia_consumata_metano';
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

      const tooltip = KpiOptions.buildTooltipWith('KWh/10t');

      if (this.isMobile) {
        this.currentOptions =
          KpiOptions.buildStackedOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltip(tooltip);
      }
    }
  }
}

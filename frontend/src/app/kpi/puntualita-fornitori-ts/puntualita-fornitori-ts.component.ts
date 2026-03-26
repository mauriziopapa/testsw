import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { ChartTarget } from 'src/app/models/chart-target';

@Component({
  selector: 'puntualita-fornitori-ts',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './puntualita-fornitori-ts.component.html',
  styleUrls: ['./puntualita-fornitori-ts.component.scss']
})
export class PuntualitaFornitoriTSComponent extends AbstractKPIComponent {
  override name = 'puntualita-fornitori-ts';
  override url = 'puntualita_fornitori_ts';
  currentOptions: any;
  puntuali = 0;
  in_ritardo = 0;
  tot = 0;
  anno = 2023;

  buildData(result: any): void {
    this.puntuali = 0;
    this.in_ritardo = 0;
    this.tot = 0;
    if (result) {
      const valueGroup = result.valueGroup;
      const labels = valueGroup.map((l: any) => l.label);
      const targets = valueGroup.map((d: any) => d.target);
      const stackArray = valueGroup.flatMap((r: any) => r.valori).map((l: any) => l.label);
      const stackValues = valueGroup.flatMap((r: any) => r.valori);
      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      this.tot = result.ordini;
      this.in_ritardo = result.ordiniInRitardo;
      this.puntuali = this.tot - this.in_ritardo;

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildStackedOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

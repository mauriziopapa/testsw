import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'numero-campionature',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './numero-campionature.component.html',
  styleUrls: ['./numero-campionature.component.scss']
})
export class NumeroCampionatureComponent extends AbstractKPIComponent {
  override name = 'numero-camp';
  override url = 'numero_campionature';
  currentOptions: any;
  tot_auto = 0;
  tot_noauto = 0;
  tot = 0;

  buildData(result: any): void {
    this.tot_auto = result.tot_auto;
    this.tot_noauto = result.tot_noauto;
    this.tot = result.tot;
    if (result) {
      const valueGroup = result.valueGroup;
      const labels = valueGroup.map((l: any) => l.label);
      const targets = valueGroup.map((d: any) => d.target);
      const stackArray = valueGroup.flatMap((r: any) => r.valori).map((l: any) => l.label);
      const stackValues = valueGroup.flatMap((r: any) => r.valori);
      const stacks = new Set(stackArray);

      const datasets = ChartGroupData.buildDatasetsFromStacks(stacks, stackValues);

      // Per mantenere gli stessi colori associati ad automotive/nonautomotive devo creare delle nuove barre
      const automotiveColors = [];
      if (this.filters.tipology === '-tutte-' || this.filters.tipology === 'automotive') {
        automotiveColors.push(
          ChartGroupData.builCustomdBar(
            datasets[0].data,
            datasets[0].label,
            datasets[0].stack,
            Colors.ORANGE,
            Colors.ORANGE_HOVER
          ),
          ChartTarget.buildLine(datasets[2].data, datasets[2].label, Colors.ORANGE, Colors.ORANGE)
        );
      }

      if (this.filters.tipology === '-tutte-' || this.filters.tipology === 'non_automotive') {
        automotiveColors.push(
          ChartGroupData.builCustomdBar(
            datasets[1].data,
            datasets[1].label,
            datasets[1].stack,
            Colors.BLUE,
            Colors.BLUE_HOVER
          ),
          ChartTarget.buildLine(datasets[3].data, datasets[3].label, Colors.BLUE, Colors.BLUE)
        );
      }

      automotiveColors.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets: automotiveColors };

      const tooltip = KpiOptions.buildTooltipWith('#');
      this.currentOptions = KpiOptions.buildMixedOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

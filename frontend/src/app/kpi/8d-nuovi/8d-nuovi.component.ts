import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'd8-nuovi',
    imports: [StackedBarChartModule, SharedModule],
    templateUrl: './8d-nuovi.component.html',
    styleUrls: ['./8d-nuovi.component.scss']
})
export class D8NuoviComponent extends AbstractKPIComponent {
  override name = '8d-nuovi';
  override url = '8d_nuovi';
  currentOptions: any;
  nc_tot = 0;

  buildData(result: any): void {
    this.nc_tot = result.nc_tot;

    const results = result.results;

    if (Array.isArray(results)) {
      const labels = results.map((l: any) => l.label);
      const targets = results.map((d: any) => d.target);
      const stackArray = results.flatMap((r: any) => r.valori).map((l: any) => l.label);
      const stackValues = results.flatMap((r: any) => r.valori);
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
          )
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
          )
        );
      }

      if (
        this.filters.tipology === '-tutte-' ||
        this.filters.tipology === 'automotive' ||
        this.filters.tipology === 'non_automotive'
      ) {
        automotiveColors.push(
          ChartTarget.buildLine(
            datasets[2].data,
            datasets[2].label,
            Colors.VIOLET,
            Colors.VIOLET_HOVER
          )
        );
      }

      automotiveColors.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets: automotiveColors };

      const tooltip = KpiOptions.buildTooltipWith('#');
      this.currentOptions = KpiOptions.buildMixedOptionWithCustomTooltip(tooltip);
    }
  }
}

import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'ppm-scarti',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './ppm-scarti.component.html',
  styleUrls: ['./ppm-scarti.component.scss']
})
export class PPMScartiComponent extends AbstractKPIComponent {
  override name = 'ppm-scarti';
  override url = 'ppm_scarti';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l: any) => l.label);
      const targets = result.map((d: any) => d.target);
      const stackArray = result.flatMap((r: any) => r.valori).map((l: any) => l.label);
      const stackValues = result.flatMap((r: any) => r.valori);
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

      if (this.filters.tipology === '-tutte-') {
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

      const tooltip = KpiOptions.buildTooltipWith('');
      this.currentOptions = KpiOptions.buildMixedOptionWithCustomTooltip(tooltip);
      // Aggiunge la scala logaritmica all'asse Y
      this.currentOptions = {
        ...this.currentOptions,
        scales: {
          y: {
            type: 'logarithmic',
            title: {
              display: false,
              text: 'Logarithmic Scale'
            },
            min: 10,
            ticks: {
              maxTicksLimit: 10, // Limita il numero massimo di tick principali
              callback: function (value: number) {
                return value + ' PPM';
              }
            }
          }
        }
      };
    }
  }
}

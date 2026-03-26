import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartGroupData } from 'src/app/models/chart-group-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { Scale } from 'chart.js';

@Component({
  selector: 'ripartizione-ore-manutenzione',
  standalone: true,
  imports: [StackedBarChartModule, SharedModule],
  templateUrl: './ripartizione-ore-manutenzione.component.html',
  styleUrls: ['./ripartizione-ore-manutenzione.component.scss']
})
export class RipartizioneOreManutenzioneComponent extends AbstractKPIComponent {
  override name = 'ripartizione-ore-manutenzione';
  override url = 'ripartizione_ore_manutenzione';
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

      const yearFilter = parseInt(this.filters.year.substring(2));

      const scales = {
        y: {
          stacked: true,
          grid: {
            display: true,
            color: '#cccccc'
          }
        },
        x: {
          stacked: true,
          grid: {
            display: false
          },
          ticks: {
            callback: function (value: number, index: number) {
              return `${yearFilter - 1}-${yearFilter}`;
            }
          }
        },
        xAxis1: {
          stacked: true,
          type: 'category',
          grid: {
            drawOnChartArea: false // only want the grid lines for one axis to show up
          },
          ticks: {
            callback: function (value: number, index: number) {
              const self = <Scale>(<unknown>this);
              return self.getLabelForValue(value);
            }
          }
        }
      };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildStackedOptionWithCustomTooltipNoLegend(tooltip, scales);
    }
  }
}

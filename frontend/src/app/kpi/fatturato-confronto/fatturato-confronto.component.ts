import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'fatturato-confronto',
    imports: [BarChartModule, SharedModule],
    templateUrl: './fatturato-confronto.component.html',
    styleUrls: ['./fatturato-confronto.component.scss']
})
export class FatturatoConfrontoComponent extends AbstractKPIComponent {
  override name = 'fatturato-confronto';
  override url = 'fatturato_confronto';
  currentOptions: any;

  fatturato = 0;
  fatturato_prec = 0;
  budget = 0;

  buildData(result: any): void {
    this.fatturato = result.fatturato;
    this.fatturato_prec = result.fatturato_prec;
    this.budget = result.budget;

    if (Array.isArray(result.data)) {
      const labels = result.data.map((l: any) => l.label);
      const valori = result.data.map((d: any) => d.valori);

      const datasetArray = KpiData.buildFromMapToArray(valori);
      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        })
      ];

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');

      if (this.isMobile) {
        this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
      }
    }
  }
}

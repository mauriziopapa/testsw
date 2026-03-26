import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'laboratorio',
    imports: [BarChartModule, SharedModule],
    templateUrl: './laboratorio.component.html',
    styleUrls: ['./laboratorio.component.scss']
})
export class LaboratorioKpiComponent extends AbstractKPIComponent {
  override name = 'laboratorio';
  override url = 'laboratorio';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const valori = result.map((d) => d.valori);
      const targets = result.map((d) => d.target);

      const val = valori.map((v) => v[0].data);
      const avg = valori.map((v) => v[1].data);
      const barLabel = valori[0][0].label;
      const avgLabel = valori[0][1].label;

      const datasets = [];

      datasets.push(ChartData.builCustomdBar(val, barLabel, Colors.BLUE, Colors.BLUE_HOVER));
      datasets.push(ChartTarget.buildLine(avg, avgLabel, Colors.VIOLET, Colors.VIOLET_HOVER));
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('costi/provini');

      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

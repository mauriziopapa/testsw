import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'perc-assenteismo',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './perc-assenteismo.component.html',
  styleUrls: ['./perc-assenteismo.component.scss']
})
export class PercAssenteismoComponent extends AbstractKPIComponent {
  override name = 'perc-assenteismo';
  override url = 'perc_assenteismo';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
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

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

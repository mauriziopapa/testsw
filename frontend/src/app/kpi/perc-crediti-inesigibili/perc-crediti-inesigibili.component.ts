import { Component } from '@angular/core';
import { BarChartComponent } from 'src/app/charts/bar-chart/bar-chart.component';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'perc-crediti-inesigibili',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './perc-crediti-inesigibili.component.html',
  styleUrls: ['./perc-crediti-inesigibili.component.scss']
})
export class PercCreditiInesigibiliComponent extends AbstractKPIComponent {
  override name = 'perc-crediti-inesigibili';
  override url = 'perc_crediti_inesigibili';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const valori = result.flatMap((d) => d.valori);
      const targets = result.map((d) => d.target);

      const val = valori.map((v) => v.data);
      const barLabel = valori[0].label;

      const datasets = [];
      datasets.push(ChartData.builCustomdBar(val, barLabel, Colors.BLUE, Colors.BLUE_HOVER));
      datasets.push(ChartTarget.buildTarget(targets));

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

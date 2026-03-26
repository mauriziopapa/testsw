import moment from 'moment';
import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { KpiOptions } from 'src/app/models/kpi-options';

@Component({
  selector: 'mean-time-to-repair',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './mean-time-to-repair.component.html',
  styleUrls: ['./mean-time-to-repair.component.scss']
})
export class MeanTimeToRepairComponent extends AbstractKPIComponent {
  override name = 'mean-time-to-repair';
  override url = 'mean_time_to_repair';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const val = result.map((d) => d.val);
      const val_prec = result.map((d) => d.val_prec);
      const targets = result.map((d) => d.target);

      const datasets = [];
      datasets.push(ChartData.builCustomdBar(val, 'MTTR', Colors.BLUE, Colors.BLUE_HOVER));
      datasets.push(
        ChartData.builCustomdBar(val_prec, 'MTTR prec.', Colors.ORANGE, Colors.ORANGE_HOVER)
      );

      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('h');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

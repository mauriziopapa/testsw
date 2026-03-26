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
    selector: 'mean-time-between-repair-IND',
    imports: [BarChartModule, SharedModule],
    templateUrl: './mean-time-between-repair-IND.component.html',
    styleUrls: ['./mean-time-between-repair-IND.component.scss']
})
export class MeanTimeBetweenRepairINDComponent extends AbstractKPIComponent {
  override name = 'mean-time-between-repair-IND';
  override url = 'mean_time_between_repair';
  currentOptions: any;

  override searchByFilters(filters: any) {
    this.filters.tipology = 'IND';
    this.filters.target = filters.target;
    this.filters.from = moment(filters.from).format('YYYY-MM');
    this.filters.to = moment(filters.to).format('YYYY-MM');

    this.kpiService.getKpi(this.url, this.filters).subscribe({
      next: (result) => {
        this.buildData(result);
      }
    });
  }

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const val = result.map((d) => d.val);
      const val_prec = result.map((d) => d.val_prec);
      const targets = result.map((d) => d.target);

      const datasets = [];
      datasets.push(ChartData.builCustomdBar(val, 'MTBR', Colors.BLUE, Colors.BLUE_HOVER));
      datasets.push(
        ChartData.builCustomdBar(val_prec, 'MTBR prec.', Colors.ORANGE, Colors.ORANGE_HOVER)
      );

      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('h');

      if (this.isMobile) {
        this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
      } else {
        this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
      }
    }
  }
}

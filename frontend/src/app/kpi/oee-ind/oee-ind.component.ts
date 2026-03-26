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
    selector: 'oee-ind',
    imports: [BarChartModule, SharedModule],
    templateUrl: './oee-ind.component.html',
    styleUrls: ['./oee-ind.component.scss']
})
export class OEEIndComponent extends AbstractKPIComponent {
  override name = 'oee-ind';
  override url = 'oee';
  currentOptions: any;

  override searchByFilters(filters: any) {
    this.filters.target = filters.target;
    this.filters.from = moment(filters.from).format('YYYY-MM');
    this.filters.to = moment(filters.to).format('YYYY-MM');
    this.filters.reparto = 'IND';

    this.kpiService.getKpi(this.url, this.filters, this.kpi_number).subscribe({
      next: (result) => {
        this.buildData(result);
      }
    });
  }

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const val = result.map((d) => d.val);
      const val_medio = result.map((d) => d.val_medio);
      const targets = result.map((d) => d.target);

      const datasets = [];
      datasets.push(ChartData.builCustomdBar(val, 'OEE IND', Colors.BLUE, Colors.BLUE_HOVER));
      datasets.push(
        ChartTarget.buildLine(
          val_medio,
          'Media mobile',
          Colors.VIOLET,
          Colors.VIOLET_HOVER
        )
      );
     
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

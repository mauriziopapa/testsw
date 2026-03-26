import moment from 'moment';
import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { KpiData } from 'src/app/models/kpi-data';
import { Colors } from 'src/app/models/colors';
import { ChartData } from 'src/app/models/chart-data';
import { KpiOptions } from 'src/app/models/kpi-options';
import { ChartTarget } from 'src/app/models/chart-target';

@Component({
  selector: 'efficacia-commerciale-chiusura',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './efficacia-commerciale-chiusura.component.html',
  styleUrls: ['./efficacia-commerciale-chiusura.component.scss']
})
export class EfficaciaCommercialeChiusuraComponent extends AbstractKPIComponent {
  override name = 'efficacia-commerciale-chiusura';
  override url = 'efficacia_commerciale/chiusura';
  currentOptions: any;

  override searchByFilters(filters: any) {
    this.filters.offer = filters.offer;
    this.filters.target = filters.target;
    this.filters.from = moment(filters.from).format('YYYY-MM');
    this.filters.to = moment(filters.to).format('YYYY-MM');

    this.kpiService.getKpi(this.url, this.filters, this.kpi_number).subscribe({
      next: (result) => {
        this.buildData(result);
      }
    });
  }

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const valori = result.map((d) => d.valori);
      const targets = result.map((d) => d.target);

      const datasetArray = KpiData.buildFromMapToArray(valori);
      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        })
      ];
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

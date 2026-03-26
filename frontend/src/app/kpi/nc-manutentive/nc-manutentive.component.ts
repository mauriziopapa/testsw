import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { KpiOptions } from 'src/app/models/kpi-options';
import { KpiData } from 'src/app/models/kpi-data';

@Component({
    selector: 'nc-manutentive',
    imports: [BarChartModule, SharedModule],
    templateUrl: './nc-manutentive.component.html',
    styleUrls: ['./nc-manutentive.component.scss']
})
export class NcManutentiveComponent extends AbstractKPIComponent {
  override name = 'nc-manutentive';
  override url = 'nc_manutentive';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l: any) => l.label);
      const valori = result.map((d: any) => d.valori);
      const targets = result.map((d: any) => d.target);

      const datasetArray = KpiData.buildFromMapToArray(valori);
      const datasets = [];
      datasets.push(
        ChartData.builCustomdBar(
          datasetArray[0].data,
          'N° NC Manutentive',
          Colors.BLUE,
          Colors.BLUE_HOVER
        ),
        ChartTarget.buildLine(
          datasetArray[1].data,
          datasetArray[1].label,
          Colors.VIOLET,
          Colors.VIOLET_HOVER
        )
      );
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

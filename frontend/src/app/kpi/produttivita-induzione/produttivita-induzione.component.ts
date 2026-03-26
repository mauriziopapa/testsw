import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'produttivita-induzione',
    imports: [BarChartModule, SharedModule],
    templateUrl: './produttivita-induzione.component.html',
    styleUrls: ['./produttivita-induzione.component.scss']
})
export class ProduttivitaInduzioneComponent extends AbstractKPIComponent {
  override name = 'produttivita-induzione';
  override url = 'produttivita_induzione';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const val = result.map((d) => d.val);
      const val_medio = result.map((d) => d.val_medio);
      const targets = result.map((d) => d.target);

      const datasets = [];
      datasets.push(ChartData.builCustomdBar(val, '% Prod Ind', Colors.BLUE, Colors.BLUE_HOVER));
      datasets.push(
        ChartTarget.buildLine(val_medio, 'Media mobile', Colors.VIOLET, Colors.VIOLET_HOVER)
      );
   
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

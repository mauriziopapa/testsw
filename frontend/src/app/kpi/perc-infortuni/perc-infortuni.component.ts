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
  selector: 'perc-infortuni',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './perc-infortuni.component.html',
  styleUrls: ['./perc-infortuni.component.scss']
})
export class PercInfortuniComponent extends AbstractKPIComponent {
  override name = 'perc-infortuni';
  override url = 'perc_infortuni';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l: any) => l.label);
      const valori = result.map((d: any) => d.val);
      const targets = result.map((d: any) => d.target);
      const average = result.map((d: any) => d.average);

      const datasets = [];
      datasets.push(
        ChartData.builCustomdBar(
          valori,
          '% Infortuni del mese',
          Colors.BLUE,
          Colors.BLUE_HOVER
        ),
        ChartTarget.buildLine(
          average,
          'Media Mobile % Infortuni',
          Colors.VIOLET,
          Colors.VIOLET_HOVER
        )
      );
      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithCustomTooltip(tooltip);
    }
  }
}

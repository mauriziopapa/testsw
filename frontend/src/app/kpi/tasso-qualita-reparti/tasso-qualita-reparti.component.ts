import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
  selector: 'tasso-qualita-reparti',
  standalone: true,
  imports: [BarChartModule, SharedModule],
  templateUrl: './tasso-qualita-reparti.component.html',
  styleUrls: ['./tasso-qualita-reparti.component.scss']
})
export class TassoQualitaRepartiComponent extends AbstractKPIComponent {
  override name = 'tasso-qualita-reparti';
  override url = 'tasso_qualita';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const val = result.map((d) => d.val);
      const val_prec = result.map((d) => d.val_prec);
      const targets = result.map((d) => d.target);

      const datasets = [];
      datasets.push(
        ChartData.builCustomdBar(val, '% Tasso Qualità', Colors.BLUE, Colors.BLUE_HOVER)
      );
      datasets.push(
        ChartData.builCustomdBar(
          val_prec,
          'Valore medio periodo prec',
          Colors.ORANGE,
          Colors.ORANGE_HOVER
        )
      );

      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

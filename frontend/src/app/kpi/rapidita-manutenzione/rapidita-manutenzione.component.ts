import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { KpiOptions } from 'src/app/models/kpi-options';

@Component({
    selector: 'rapidita-manutenzione',
    imports: [BarChartModule, SharedModule],
    templateUrl: './rapidita-manutenzione.component.html',
    styleUrls: ['./rapidita-manutenzione.component.scss']
})
export class RapiditaManutenzioneComponent extends AbstractKPIComponent {
  override name = 'rapidita-manutenzione';
  override url = 'rapidita_manutenzione';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const predittiva = result.map((d) => d.predittiva);
      const programmata = result.map((d) => d.programmata);
      const programmataAvg = result.map((d) => d.programmataMovingAverage);
      const predittivaAvg = result.map((d) => d.predittivaMovingAverage);
      const targets = result.map((d) => d.target);

      const datasets = [];
      datasets.push(
        ChartData.builCustomdBar(
          programmata,
          'Ritardo Programmata',
          Colors.GREEN,
          Colors.GREEN_HOVER
        )
      );
      datasets.push(
        ChartData.builCustomdBar(
          predittiva,
          'Ritardo Predittiva',
          Colors.VIOLET,
          Colors.VIOLET_HOVER
        )
      );
      datasets.push(
        ChartTarget.buildLine(
          programmataAvg,
          'Ritardo Programmata Media',
          Colors.ORANGE,
          Colors.ORANGE_HOVER
        )
      );
      datasets.push(
        ChartTarget.buildLine(
          predittivaAvg,
          'Ritardo Predittiva Media',
          Colors.BLUE,
          Colors.BLUE_HOVER
        )
      );

      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('%');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

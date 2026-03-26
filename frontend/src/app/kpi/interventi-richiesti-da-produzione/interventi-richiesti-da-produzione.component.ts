import { Component } from '@angular/core';
import { BarChartModule } from 'src/app/charts/bar-chart/bar-chart.module';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiOptions } from 'src/app/models/kpi-options';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';
import { ChartData } from 'src/app/models/chart-data';

@Component({
    selector: 'interventi-richiesti-da-produzione',
    imports: [BarChartModule, SharedModule],
    templateUrl: './interventi-richiesti-da-produzione.component.html',
    styleUrls: ['./interventi-richiesti-da-produzione.component.scss']
})
export class InterventiRichiestiDaProduzioneComponent extends AbstractKPIComponent {
  override name = 'interventi-richiesti-da-produzione';
  override url = 'attivita_manutenzione';
  currentOptions: any;

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((l) => l.label);
      const targets = result.map((d) => d.target);
      const manStrao = result.map((d) => d.manStrao);
      const intRep = result.map((d) => d.intRep);
      const avgMan = result.map((d) => d.averageManStrao);
      const avgIntRep = result.map((d) => d.averageIntRep);

      const datasets = [];
      datasets.push(
        ChartData.builCustomdBar(
          manStrao,
          'N° Attività Manutenzione Straordinaria',
          Colors.BLUE,
          Colors.BLUE_HOVER
        )
      );
      datasets.push(
        ChartData.builCustomdBar(
          intRep,
          'N° Interventi Reperibilità',
          Colors.ORANGE,
          Colors.ORANGE_HOVER
        )
      );
      datasets.push(
        ChartTarget.buildLine(
          avgMan,
          'Media Mobile Attività Manutenzione',
          Colors.VIOLET,
          Colors.VIOLET_HOVER
        )
      );
      datasets.push(
        ChartTarget.buildLine(
          avgIntRep,
          'Media Mobile Interventi Reperiblilità',
          Colors.GREEN,
          Colors.GREEN_HOVER
        )
      );
      console.log(datasets);

      datasets.push(ChartTarget.buildTarget(targets));

      this.currentData = { labels, datasets };

      const tooltip = KpiOptions.buildTooltipWith('');
      this.currentOptions = KpiOptions.buildOptionWithBottomLegendAndCustomTooltip(tooltip);
    }
  }
}

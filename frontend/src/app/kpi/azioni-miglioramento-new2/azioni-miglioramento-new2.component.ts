import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { KpiData } from 'src/app/models/kpi-data';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'azioni-miglioramento-new2',
    imports: [StackedBarChartModule, SharedModule],
    templateUrl: './azioni-miglioramento-new2.component.html',
    styleUrls: ['./azioni-miglioramento-new2.component.scss']
})
export class AzioniMiglioramentoNew2Component extends AbstractKPIComponent {
  override name = 'azioni-miglioramento-new2';
  override url = 'azioni_miglioramento_new2';

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const valoriTrimestre = result.map((d) => d.valori);
      const targets = result.map((d) => d.target);

      const datasetArray = KpiData.buildFromMapToArray(valoriTrimestre);

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let color, hoverColor;
           if (arr.label === "# Aperte / In Corso") {
            color = Colors.BLUE;
            hoverColor = Colors.BLUE_HOVER;
          } else if (arr.label === "# Chiuse in tempo con esito positivo") {
            color = Colors.GREEN;
            hoverColor = Colors.GREEN_HOVER;
          } else {
            ({ color, hoverColor } = Colors.getColor(index));
          }
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        }),
        ChartTarget.buildTarget(targets)
      ];

      this.currentData = { labels, datasets };
    }
  }
}

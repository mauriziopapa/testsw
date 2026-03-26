import { Component } from '@angular/core';
import { StackedBarChartModule } from 'src/app/charts/stacked-bar-chart/stacked-bar-chart.module';
import { ChartData } from 'src/app/models/chart-data';
import { ChartTarget } from 'src/app/models/chart-target';
import { Colors } from 'src/app/models/colors';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractKPIComponent } from '../abstract-kpi.component';

@Component({
    selector: 'azioni-miglioramento-new',
    imports: [StackedBarChartModule, SharedModule],
    templateUrl: './azioni-miglioramento-new.component.html',
    styleUrls: ['./azioni-miglioramento-new.component.scss']
})
export class AzioniMiglioramentoNewComponent extends AbstractKPIComponent {
  override name = 'azioni-miglioramento-new';
  override url = 'azioni_miglioramento_new';

  buildData(result: any[]): void {
    if (Array.isArray(result)) {
      const labels = result.map((d) => d.label);
      const valoriTrimestre = result.map((d) => d.valori);
      const targets = result.map((d) => d.target);

      const datasetValues = new Map();
      const datasetSize = valoriTrimestre[0].length;

      // costruisco la struttura dati per il grafico che deve essere un array con
      // label: 'Dataset 1',
      // data: []
      for (let i = 0; i < datasetSize; i++) {
        for (let j = 0; j < valoriTrimestre.length; j++) {
          const valorePerPersona = valoriTrimestre[j];
          if (datasetValues.has(valorePerPersona[i].label)) {
            datasetValues.get(valorePerPersona[i].label).push(valorePerPersona[i].data);
          } else {
            datasetValues.set(valorePerPersona[i].label, [valorePerPersona[i].data]);
          }
        }
      }

      const datasetArray = Array.from(datasetValues, ([label, data]) => ({ label, data }));

      const datasets = [
        ...datasetArray.map((arr: any, index: number) => {
          let { color, hoverColor } = Colors.getColor(index);
          return ChartData.builCustomdBar(arr.data, arr.label, color, hoverColor);
        }),
        ChartTarget.buildTarget(targets)
      ];

      this.currentData = { labels, datasets };
    }
  }
}
